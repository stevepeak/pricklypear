import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleError } from "../utils/handle-error.ts";
import { getOpenAIClient } from "../utils/openai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { file_path, filename } = await req.json();

    if (!file_path || !filename) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: user_id, file_path, filename",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify that the file path belongs to the authenticated user
    if (!file_path.startsWith(`${user.id}/`)) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized: File path does not belong to user",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(file_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert blob to buffer
    const buffer = await fileData.arrayBuffer();
    const fileExtension = filename.toLowerCase().split(".").pop();

    let extractedText = "";
    let wordCount = 0;

    if (fileExtension === "pdf") {
      // For PDF extraction, we'll use a simple text extraction approach
      // Note: This is a basic implementation. For production, consider using a more robust PDF parser
      const textDecoder = new TextDecoder();
      const pdfText = textDecoder.decode(buffer);

      // Extract text between stream objects (basic PDF text extraction)
      const streamMatches = pdfText.match(/stream\s*(.*?)\s*endstream/gs);
      if (streamMatches) {
        extractedText = streamMatches
          .map((match) => match.replace(/^stream\s*|\s*endstream$/g, ""))
          .join(" ")
          .replace(/[^\w\s.,;:!?()-]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    } else if (fileExtension === "docx") {
      // For DOCX, we'll implement a basic XML extraction
      // Note: This is a simplified approach. For production, consider using mammoth or similar
      const textDecoder = new TextDecoder();
      const docxText = textDecoder.decode(buffer);

      // Extract text from XML content (basic approach)
      const textMatches = docxText.match(/<w:t[^>]*>(.*?)<\/w:t>/gs);
      if (textMatches) {
        extractedText = textMatches
          .map((match) => match.replace(/<[^>]*>/g, ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
      }
    } else {
      return new Response(
        JSON.stringify({
          error: "Unsupported file type. Only PDF and DOCX are supported.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Clean and normalize text
    extractedText = Array.from(extractedText)
      .map((ch) => {
        const code = ch.charCodeAt(0);
        // Remove control characters (0-31, 127-159)
        if ((code >= 0 && code <= 31) || (code >= 127 && code <= 159)) {
          return " ";
        }
        return ch;
      })
      .join("")
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    wordCount = extractedText
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    if (!extractedText || extractedText.length < 10) {
      return new Response(
        JSON.stringify({
          error: "Could not extract meaningful text from document",
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate embedding using OpenAI
    let embedding = null;

    if (extractedText.length > 0) {
      try {
        const openai = getOpenAIClient();
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          // TODO fix this to properly chunk the document
          input: extractedText.substring(0, 8000), // Limit input length
        });
        if (
          embeddingResponse &&
          embeddingResponse.data &&
          embeddingResponse.data[0]?.embedding
        ) {
          embedding = embeddingResponse.data[0].embedding;
        }
      } catch (embeddingError) {
        console.error("Failed to generate embedding:", embeddingError);
        // Continue without embedding if OpenAI fails
      }
    }

    // Store in database
    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        file_path,
        filename,
        extracted_text: extractedText,
        embedding,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to store document: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        document_id: document.id,
        word_count: wordCount,
        message: "Document successfully extracted and stored.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return handleError(error);
  }
});
