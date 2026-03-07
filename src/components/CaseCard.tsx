import { MessageSquare, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface CaseCardProps {
  caseData: {
    id: string;
    title: string;
    description: string;
    industry: string | null;
    opinion_count: number;
    status: string;
    created_at: string;
  };
  onClick: () => void;
}

const CaseCard = ({ caseData, onClick }: CaseCardProps) => {
  return (
    <button
      onClick={onClick}
      className="glass-card p-6 text-left w-full hover:border-primary/30 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        {caseData.industry && (
          <Badge variant="secondary" className="text-xs">
            {caseData.industry}
          </Badge>
        )}
        <Badge variant={caseData.status === "active" ? "default" : "secondary"} className="text-xs">
          {caseData.status}
        </Badge>
      </div>

      <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
        {caseData.title}
      </h3>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {caseData.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {caseData.opinion_count} opinions
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(caseData.created_at), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
};

export default CaseCard;
