"use client";

import { useState } from "react";
import { Plus, Loader2, History, CheckCircle2, ClipboardList, Truck, Wrench, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addClaimProgress } from "@/lib/actions/agent.actions";
import { Badge } from "@/components/ui/badge";

const COMMON_UPDATES = [
  { title: "Review Started", icon: ClipboardList },
  { title: "Assessor Dispatched", icon: Truck },
  { title: "Repairs Authorized", icon: Wrench },
  { title: "Documents Verified", icon: FileCheck },
  { title: "Payment Processed", icon: CheckCircle2 },
];

export function AgentProgressManager({ claimId }: { claimId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if(!title) {
        toast.error("Title is required");
        return;
    }
    
    setLoading(true);
    const res = await addClaimProgress(claimId, title, desc);
    setLoading(false);

    if(res.success) {
        toast.success("Timeline updated successfully");
        setIsOpen(false);
        setTitle("");
        setDesc("");
    } else {
        toast.error(res.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 border-dashed">
          <History className="w-3.5 h-3.5" />
          Update Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            Update Claim Timeline
          </DialogTitle>
          <DialogDescription>
            Add a new milestone to tracking history for Claim #{claimId}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Quick Select */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_UPDATES.map((item) => (
                <Badge 
                  key={item.title}
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3 flex items-center gap-1.5"
                  onClick={() => setTitle(item.title)}
                >
                  <item.icon className="w-3 h-3" />
                  {item.title}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Stage Title</Label>
                <Input 
                    id="title"
                    placeholder="e.g. Assessor Dispatched" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="font-medium"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="desc">Details (Optional)</Label>
                <Textarea 
                    id="desc"
                    placeholder="Provide additional context about this step..." 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="resize-none min-h-[100px]"
                />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Timeline Entry
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}