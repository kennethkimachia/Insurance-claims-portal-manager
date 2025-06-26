"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAgent } from "@/app/_Actions/Admin/Users";

export default function CreateAgentForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedName || !trimmedPassword) {
      alert("Name, email, and password cannot be empty or whitespace.");
      setLoading(false);
      return;
    }
    try {
      await createAgent({ email: trimmedEmail, name: trimmedName, password: trimmedPassword });
      setEmail("");
      setName("");
      setPassword("");
      alert("Agent created!");
    } catch (err: any) {
      if (err?.errors && Array.isArray(err.errors) && err.errors[0]?.message) {
        alert("Error: " + err.errors[0].message);
      } else {
        alert("Error creating agent");
      }
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Agent Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <Input
        placeholder="Agent Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Agent"}
      </Button>
    </form>
  );
}