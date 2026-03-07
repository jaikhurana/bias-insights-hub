import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Retail", "Energy", "Manufacturing", "Consulting", "Other"];

interface CreateCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateCaseDialog = ({ open, onOpenChange, onCreated }: CreateCaseDialogProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("cases").insert({
      title: title.trim(),
      description: description.trim(),
      industry: industry || null,
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to create case");
    } else {
      toast.success("Case created!");
      setTitle("");
      setDescription("");
      setIndustry("");
      onOpenChange(false);
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="case-title">Title</Label>
            <Input
              id="case-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Should Tesla expand into India?"
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="case-desc">Description</Label>
            <Textarea
              id="case-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the business case and key decision points..."
              required
              maxLength={2000}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(ind => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Case"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCaseDialog;
