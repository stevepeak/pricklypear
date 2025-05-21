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

export default function FeatureRequestPage() {
  const form = useForm({ defaultValues: { title: "", description: "" } });
  const [status, setStatus] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  async function onSubmit(values: { title: string; description: string }) {
    setStatus(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "feature-request",
        {
          body: values,
        },
      );
      if (error) {
        setStatus({
          type: "error",
          message: error.message || "Submission failed.",
        });
        return;
      }
      if (data?.success) {
        setStatus({ type: "success", message: "Feature request submitted!" });
        form.reset();
      } else {
        setStatus({
          type: "error",
          message: data?.message || "Submission failed.",
        });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Submit a Feature Request</h1>
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
          <Button type="submit" className="w-full">
            Submit
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
