"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { reportError } from "@/utils/error-monitor";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  silent?: boolean;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Component Error Boundary bọc quanh các section phụ (Phase 12)
 * Ngăn chặn lỗi runtime trong một component phụ làm sập cả trang web
 */
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, {
      component: this.props.sectionName || "SectionErrorBoundary",
      extra: { componentStack: errorInfo.componentStack?.slice(0, 500) },
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: undefined });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      if (this.props.silent) {
        return null;
      }

      return (
        <div className="my-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium">
            <AlertCircle className="w-4 h-4 text-zinc-400" />
            <span>Không thể hiển thị phần nội dung này</span>
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Thử lại</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
