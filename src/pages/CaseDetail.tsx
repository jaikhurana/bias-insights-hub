import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import BiasAnalysisCard from "@/components/BiasAnalysisCard";
import { formatDistanceToNow } from "date-fns";

interface CaseData {
  id: string;
  title: string;
  description: string;
  industry: string | null;
  status: string;
  created_at: string;
}

interface OpinionData {
  id: string;
  content: string;
  stance: string | null;
  user_id: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

interface BiasAnalysis {
  id: string;
  opinion_id: string;
  biases: any;
  perspectives: any;
  debate_for: string[];
  debate_against: string[];
}

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [opinions, setOpinions] = useState<OpinionData[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, BiasAnalysis>>({});
  const [newOpinion, setNewOpinion] = useState("");
  const [stance, setStance] = useState<string>("neutral");
  const [submitting, setSubmitting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const fetchCase = async () => {
    if (!id) return;
    const { data } = await supabase.from("cases").select("*").eq("id", id).single();
    if (data) setCaseData(data);
  };

  const fetchOpinions = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("opinions")
      .select("*, profiles(display_name)")
      .eq("case_id", id)
      .order("created_at", { ascending: true });
    if (data) setOpinions(data as any);
  };

  const fetchAnalyses = async () => {
    if (!id) return;
    const { data: opData } = await supabase
      .from("opinions")
      .select("id")
      .eq("case_id", id);
    if (!opData || opData.length === 0) return;

    const opIds = opData.map(o => o.id);
    const { data } = await supabase
      .from("bias_analyses")
      .select("*")
      .in("opinion_id", opIds);
    if (data) {
      const map: Record<string, BiasAnalysis> = {};
      data.forEach(a => { map[a.opinion_id] = a as BiasAnalysis; });
      setAnalyses(map);
    }
  };

  useEffect(() => {
    fetchCase();
    fetchOpinions();
    fetchAnalyses();
  }, [id]);

  const submitOpinion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newOpinion.trim()) return;
    setSubmitting(true);

    const { data, error } = await supabase.from("opinions").insert({
      case_id: id,
      user_id: user.id,
      content: newOpinion.trim(),
      stance,
    }).select().single();

    if (error) {
      toast.error("Failed to post opinion");
    } else {
      toast.success("Opinion posted!");
      setNewOpinion("");
      fetchOpinions();
      fetchCase();
      // Auto-analyze
      if (data) analyzeOpinion(data.id, newOpinion.trim());
    }
    setSubmitting(false);
  };

  const analyzeOpinion = async (opinionId: string, content: string) => {
    setAnalyzingId(opinionId);
    try {
      const resp = await supabase.functions.invoke("analyze-bias", {
        body: { opinionId, content, caseTitle: caseData?.title || "" },
      });

      if (resp.error) throw resp.error;
      fetchAnalyses();
      toast.success("AI analysis complete!");
    } catch {
      toast.error("AI analysis failed");
    }
    setAnalyzingId(null);
  };

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">BiasCheck</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Case Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {caseData.industry && <Badge variant="secondary">{caseData.industry}</Badge>}
            <Badge variant={caseData.status === "active" ? "default" : "secondary"}>{caseData.status}</Badge>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">{caseData.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{caseData.description}</p>
        </motion.div>

        {/* Post Opinion */}
        <div className="glass-card p-6 mb-8">
          <h3 className="font-display font-semibold text-foreground mb-4">Share Your Opinion</h3>
          <form onSubmit={submitOpinion} className="space-y-4">
            <Textarea
              value={newOpinion}
              onChange={(e) => setNewOpinion(e.target.value)}
              placeholder="What's your take on this business decision? The AI will analyze your reasoning for cognitive biases..."
              rows={4}
              maxLength={3000}
              required
            />
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {(["for", "neutral", "against"] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStance(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      stance === s
                        ? s === "for"
                          ? "bg-bias-survivorship/20 text-bias-survivorship border-bias-survivorship/40"
                          : s === "against"
                          ? "bg-destructive/20 text-destructive border-destructive/40"
                          : "bg-muted text-muted-foreground border-border"
                        : "bg-secondary text-secondary-foreground border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <Button type="submit" disabled={submitting || !newOpinion.trim()} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Post & Analyze
              </Button>
            </div>
          </form>
        </div>

        {/* Opinions */}
        <h3 className="font-display font-semibold text-foreground text-xl mb-4">
          Opinions ({opinions.length})
        </h3>
        <AnimatePresence>
          <div className="space-y-4">
            {opinions.map((op) => (
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-foreground">
                    {(op.profiles as any)?.display_name || "Anonymous"}
                  </span>
                  {op.stance && (
                    <Badge
                      variant="secondary"
                      className={
                        op.stance === "for"
                          ? "bg-bias-survivorship/20 text-bias-survivorship"
                          : op.stance === "against"
                          ? "bg-destructive/20 text-destructive"
                          : ""
                      }
                    >
                      {op.stance}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDistanceToNow(new Date(op.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground/90 leading-relaxed mb-4">{op.content}</p>

                {analyzingId === op.id ? (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is analyzing for biases...
                  </div>
                ) : analyses[op.id] ? (
                  <BiasAnalysisCard analysis={analyses[op.id]} />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => analyzeOpinion(op.id, op.content)}
                    className="text-primary hover:text-primary/80"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    Analyze for biases
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CaseDetail;
