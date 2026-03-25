import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Upload from "@/pages/upload";
import ProjectDetail from "@/pages/projectDetail";
import Assets from "@/pages/assets";
import { AuthProvider } from "@/contexts/AuthContext";
import Projects from "@/pages/projects";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";
import { usePageMeta } from "@/core/hooks/usePageMeta";

function RouteAwareMeta() {
  const [location] = useLocation();
  const isLanding = location === "/";

  usePageMeta({
    title: isLanding ? "DramaQuickCut - AI短剧解说粗剪工作台" : "DramaQuickCut",
    description: isLanding
      ? "DramaQuickCut 是面向短剧解说与粗剪工作流的 AI 视频处理平台，支持上传、分析、解说生成与成片任务管理。"
      : "DramaQuickCut 工作台",
  });

  return null;
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <RouteAwareMeta />
          <ScrollToTop />
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/upload">
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            </Route>
            <Route path="/projects">
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            </Route>
            <Route path="/project/:id">
              {(params) => (
                <ProtectedRoute>
                  <ProjectDetail id={params.id} />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/assets">
              <ProtectedRoute>
                <Assets />
              </ProtectedRoute>
            </Route>
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
