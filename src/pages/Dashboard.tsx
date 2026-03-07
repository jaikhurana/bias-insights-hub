import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, Plus, TrendingUp, MessageSquare, Users, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import CaseCard from "@/components/CaseCard";
import CreateCaseDialog from "@/components/CreateCaseDialog";

interface CaseRow {
  id: string;
  title: string;
  description: string;
  industry: string | null;
  opinion_count: number;
  status: string;
  created_at: string;
  user_id: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchCases = async () => {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCases(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();

    const channel = supabase
      .channel("cases-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cases" }, () => {
        fetchCases();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = [
    { label: "Active Cases", value: cases.filter(c => c.status === "active").length, icon: TrendingUp },
    { label: "Total Opinions", value: cases.reduce((s, c) => s + c.opinion_count, 0), icon: MessageSquare },
    { label: "Contributors", value: new Set(cases.map(c => c.user_id)).size, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold text-foreground">BiasCheck</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary/60" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cases Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-semibold text-foreground">Case Discussions</h2>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-display text-muted-foreground">No cases yet</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Create your first case discussion to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CaseCard caseData={c} onClick={() => navigate(`/case/${c.id}`)} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <CreateCaseDialog open={showCreate} onOpenChange={setShowCreate} onCreated={fetchCases} />
    </div>
  );
};

export default Dashboard;
