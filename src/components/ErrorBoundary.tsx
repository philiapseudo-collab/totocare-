import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-lg w-full animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-12 w-12 text-destructive" strokeWidth={1.5} />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                  <p className="text-muted-foreground">
                    We encountered an unexpected error. Don't worry, your data is safe.
                  </p>
                </div>

                {this.state.error && (
                  <details className="w-full text-left">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Technical details
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono overflow-auto max-h-32">
                      {this.state.error.toString()}
                    </div>
                  </details>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={this.handleReset}
                    variant="default"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => window.location.href = "/"}
                    variant="outline"
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground pt-2">
                  If this problem persists, please contact support
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
