import { AlertTriangle, Lightbulb, Scale } from "lucide-react";
import { motion } from "framer-motion";

const BIAS_COLORS: Record<string, string> = {
  "Confirmation Bias": "bg-bias-confirmation/20 text-bias-confirmation border-bias-confirmation/30",
  "Anchoring Bias": "bg-bias-anchoring/20 text-bias-anchoring border-bias-anchoring/30",
  "Survivorship Bias": "bg-bias-survivorship/20 text-bias-survivorship border-bias-survivorship/30",
  "Herd Mentality": "bg-bias-herd/20 text-bias-herd border-bias-herd/30",
  "Sunk Cost Fallacy": "bg-bias-sunk-cost/20 text-bias-sunk-cost border-bias-sunk-cost/30",
};

interface Bias {
  name: string;
  explanation: string;
  severity: string;
}

interface Perspective {
  title: string;
  description: string;
}

interface BiasAnalysisCardProps {
  analysis: {
    biases: any;
    perspectives: any;
    debate_for: string[];
    debate_against: string[];
  };
}

const BiasAnalysisCard = ({ analysis }: BiasAnalysisCardProps) => {
  const biases: Bias[] = Array.isArray(analysis.biases) ? analysis.biases : [];
  const perspectives: Perspective[] = Array.isArray(analysis.perspectives) ? analysis.perspectives : [];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-4 pt-4 border-t border-border"
    >
      {/* Detected Biases */}
      {biases.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <span className="text-sm font-display font-semibold text-foreground">Detected Biases</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {biases.map((b, i) => (
              <span
                key={i}
                className={`bias-tag border ${BIAS_COLORS[b.name] || "bg-muted text-muted-foreground border-border"}`}
              >
                {b.name}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            {biases.map((b, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">{b.name}:</span> {b.explanation}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Perspectives */}
      {perspectives.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-display font-semibold text-foreground">Alternative Perspectives</span>
          </div>
          <div className="space-y-2">
            {perspectives.map((p, i) => (
              <div key={i} className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm font-medium text-foreground/90">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debate Mode */}
      {(analysis.debate_for.length > 0 || analysis.debate_against.length > 0) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-sm font-display font-semibold text-foreground">Debate Mode</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-bias-survivorship/5 border border-bias-survivorship/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-bias-survivorship mb-2">Arguments For</p>
              <ul className="space-y-1">
                {analysis.debate_for.map((a, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {a}</li>
                ))}
              </ul>
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-destructive mb-2">Arguments Against</p>
              <ul className="space-y-1">
                {analysis.debate_against.map((a, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BiasAnalysisCard;
