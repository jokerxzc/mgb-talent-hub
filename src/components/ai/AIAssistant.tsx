import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  Bot,
  Lightbulb,
  FileQuestion,
  Target,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  type: "job-match" | "application-tips" | "qualification-check" | "general";
  prompt: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation(); // Initialize useTranslation

  const quickActions: QuickAction[] = [
    {
      icon: <Target className="h-4 w-4" />,
      label: t("application_tips"),
      type: "application-tips",
      prompt: "What tips do you have for a strong government job application?",
    },
    {
      icon: <FileQuestion className="h-4 w-4" />,
      label: t("required_documents_ai"),
      type: "general",
      prompt: "What documents do I need to prepare for my application?",
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      label: t("civil_service_info"),
      type: "general",
      prompt: "What civil service eligibility do I need for government jobs?",
    },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (question: string, type: "general" | "job-match" | "application-tips" | "qualification-check" = "general") => {
    if (!question.trim()) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type,
          context: { userQuestion: question },
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || t("having_trouble_responding"),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI error:", error);
      toast({
        title: t("ai_assistant_error_title"),
        description: t("unable_to_get_response"),
        variant: "destructive",
      });
      const errorMessage: Message = {
        role: "assistant",
        content: t("having_trouble_responding"),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt, action.type);
  };

  return (
    <>
      {/* Floating button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl border-primary/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5" />
                  {t("ai_career_assistant")}
                  <Badge variant="secondary" className="ml-auto text-xs bg-white/20 text-white border-0">
                    {t("beta")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <MessageCircle className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("hi_im_here_to_help")}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground px-1">{t("quick_actions_ai")}</p>
                        {quickActions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-2 h-auto py-3 text-left"
                            onClick={() => handleQuickAction(action)}
                          >
                            {action.icon}
                            <span className="text-sm">{action.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <div className="border-t p-3 bg-muted/30">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage(input);
                    }}
                    className="flex gap-2"
                  >
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t("ask_about_jobs_qualifications")}
                      className="min-h-[44px] max-h-[120px] resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !input.trim()}
                      className="h-11 w-11 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}