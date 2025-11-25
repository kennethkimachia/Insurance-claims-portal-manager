"use client";

import { useState } from "react";
import { CheckCircle, XCircle, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner"; 
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { processClaim } from "@/lib/actions/agent.actions";

export function ClaimActionCell({ claimId }: { claimId: number }) {
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Handle Approve
  const handleApprove = async () => {
    // We can use a promise toast for better UX
    const promise = processClaim(claimId, "APPROVED");

    toast.promise(promise, {
      loading: 'Processing approval...',
      success: (res) => {
        if (!res.success) throw new Error(res.message);
        return `Claim #${claimId} approved successfully`;
      },
      error: (err) => {
        return err.message || "Failed to approve claim";
      }
    });
  };

  // Handle Reject
  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setLoading(true);
    
    try {
      const res = await processClaim(claimId, "REJECTED", reason);
      
      if (res.success) {
        toast.success(`Claim #${claimId} rejected`);
        setIsRejectOpen(false);
        setReason(""); // Reset form
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleApprove} 
            className="text-green-600 cursor-pointer focus:text-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve & Forward
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsRejectOpen(true)} 
            className="text-red-600 cursor-pointer focus:text-red-700"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject Claim
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rejection Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Claim #{claimId}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be visible to the policyholder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g., Insufficient evidence provided..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}