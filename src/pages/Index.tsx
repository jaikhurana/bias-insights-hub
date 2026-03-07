import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Zap, Eye, Scale } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && user) {
    navigate("/dashboard");
    return null;
  }

  const features = [
    {
      icon: Zap,
      title: "AI Bias Detection",
      desc: "Instantly identify confirmation bias, anchoring, survivorship bias and more in any business opinion.",
    },
    {
      icon: Eye,
      title: "Perspective Generator",
      desc: "Get AI-suggested alternative viewpoints you may have overlooked in your analysis.",
    },
    {
      icon: Scale,
      title: "Debate Mode",
      desc: "Automatically generate balanced arguments for and against any business decision.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold text-foreground">BiasCheck</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section className="py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Think you're <span className="gradient-text">unbiased?</span>
              <br />
              Think again.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              BiasCheck uses AI to detect cognitive biases in business case discussions,
              helping MBA students develop sharper analytical thinking.
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 text-base px-8 py-6">
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </section>

        {/* Features */}
        <section className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass-card p-8 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
