import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { requireCurrentUser } from "@/utils/authCache";
import { toast } from "sonner";
import { handleError } from "@/services/messageService/utils";
import { Loader2 } from "lucide-react";

export default function FeatureRequestPage() {
  const form = useForm({ defaultValues: { title: "", description: "" } });
  const [status, setStatus] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: { title: string; description: string }) {
    const user = await requireCurrentUser();
    setStatus(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "feature-request",
        {
          body: {
            title: values.title,
            description: `${values.description}\n---\n\`\`\`\n${JSON.stringify(user, null, 2)}\n\`\`\``,
          },
        },
      );
      if (error) {
        handleError(error, "Feature request submission");
        setStatus({
          type: "error",
          message: error.message || "Submission failed.",
        });
        toast("Submission failed", {
          description:
            error.message ||
            "There was a problem submitting your feature request.",
        });
        return;
      }
      if (data?.success) {
        setStatus({ type: "success", message: "Feature request submitted!" });
        toast("Feature request submitted!", {
          description: "Thank you for your feedback.",
        });
        form.reset();
      } else {
        setStatus({
          type: "error",
          message: data?.message || "Submission failed.",
        });
        toast("Submission failed", {
          description:
            data?.message ||
            "There was a problem submitting your feature request.",
        });
      }
    } catch (err) {
      handleError(err, "Feature request submission");
      setStatus({ type: "error", message: "Network error. Please try again." });
      toast("Network error", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Submit a Feature Request</h1>
      <div className="mb-6 text-sm text-muted-foreground">
        <p>
          Thank you for your honest feedback. This form is <b>only visible</b>{" "}
          to The Prickly Pear staff. We may email you with follow up questions
          and feedback.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="title"
            control={form.control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Short summary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={form.control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your feature idea in detail"
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
      {status && (
        <div
          className={`mt-4 text-center ${status.type === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
