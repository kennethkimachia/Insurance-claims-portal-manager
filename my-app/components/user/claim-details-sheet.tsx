"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Shield,
  CalendarDays
} from "lucide-react";
import { format } from "date-fns";

interface ClaimDetailsProps {
  claim: {
    id: number;
    status: string;
    createdAt: Date;
    rejection_reason: string | null;
    claim_type: string;
    agent: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    } | null;
    progressSteps: {
      id: number;
      title: string;
      description: string | null;
      createdAt: Date;
    }[];
  };
}

export function ClaimDetailsSheet({ claim }: ClaimDetailsProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20";
      case "REJECTED": return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20";
      case "CLOSED": return "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20";
      default: return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return CheckCircle2;
      case "REJECTED": return XCircle;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(claim.status);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="sr-only">View Details</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col h-full bg-background">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className={`${getStatusColor(claim.status)} px-3 py-1 flex items-center gap-1.5`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {claim.status}
            </Badge>
            <span className="text-sm text-muted-foreground font-mono">#{claim.id}</span>
          </div>
          <SheetTitle className="text-2xl font-bold mb-1">{claim.claim_type} Claim</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5" />
            Submitted on {format(new Date(claim.createdAt), "MMMM do, yyyy")}
          </SheetDescription>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            
            {/* Agent Information Card */}
            {claim.agent ? (
              <Card className="bg-muted/50 border-none shadow-none">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {claim.agent.firstName?.[0]}{claim.agent.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Assigned Agent</p>
                    <p className="font-semibold text-sm">{claim.agent.firstName} {claim.agent.lastName}</p>
                    <p className="text-xs text-muted-foreground">{claim.agent.email}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed text-muted-foreground text-sm">
                    <User className="w-4 h-4" />
                    Waiting for agent assignment...
                </div>
            )}

            {/* Rejection Alert */}
            {claim.status === "REJECTED" && claim.rejection_reason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Rejection Reason
                </div>
                <p className="text-sm text-foreground/80">{claim.rejection_reason}</p>
              </div>
            )}

            {/* Timeline Section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-primary" />
                Claim Timeline
              </h3>
              
              <div className="relative pl-6 space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

                {claim.progressSteps.length === 0 ? (
                  <div className="relative">
                     <div className="absolute -left-[20px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-muted-foreground bg-background" />
                     <p className="text-sm text-muted-foreground italic">Claim received. Pending initial review.</p>
                  </div>
                ) : (
                    claim.progressSteps.map((step, index) => (
                    <div key={step.id} className="relative group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 bg-background z-10 
                            ${index === 0 ? 'border-primary ring-4 ring-primary/10' : 'border-muted-foreground/50'}`} 
                        />
                        
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-medium ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {step.title}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                    {format(new Date(step.createdAt), "MMM d, HH:mm")}
                                </span>
                            </div>
                            {step.description && (
                                <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md mt-1">
                                    {step.description}
                                </p>
                            )}
                        </div>
                    </div>
                    ))
                )}
                
                {/* Initial Submission Item (Always at bottom) */}
                <div className="relative">
                    <div className="absolute -left-[20px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-muted-foreground bg-muted-foreground" />
                    <div className="flex flex-col gap-1 opacity-70">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-muted-foreground">Claim Submitted</span>
                            <span className="text-xs text-muted-foreground font-mono">
                                {format(new Date(claim.createdAt), "MMM d, HH:mm")}
                            </span>
                        </div>
                    </div>
                </div>

              </div>
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}