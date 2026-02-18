import { Button } from '@/components/ui/button';

interface TaskControlsProps {
  isStreaming: boolean;
  taskStatus: 'idle' | 'running' | 'cancelled';
  onCancel: () => void;
  onContinue: () => void;
}

export function TaskControls({ isStreaming, taskStatus, onCancel, onContinue }: TaskControlsProps) {
  if (taskStatus === 'idle' && !isStreaming) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      {taskStatus === 'running' || isStreaming ? (
        <>
          <div className="flex items-center gap-2 flex-1">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-sm text-muted-foreground">AI 正在思考...</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onCancel}
          >
            停止生成
          </Button>
        </>
      ) : taskStatus === 'cancelled' ? (
        <>
          <span className="text-sm text-muted-foreground flex-1">生成已停止</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onContinue}
          >
            继续
          </Button>
        </>
      ) : null}
    </div>
  );
}
