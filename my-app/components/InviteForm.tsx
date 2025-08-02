'use client';

import { Role } from '@prisma/client';
import { useState, FormEvent } from 'react';

type InviteFormProps = {
  canInviteAgents: boolean;
};

export function InviteForm({ canInviteAgents }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.USER);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    const response = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        roleToAssign: role,
        redirectUrl: window.location.origin,
      }),
    });

    if (response.ok) {
      setStatus(`Invitation sent to ${email}!`);
      setEmail('');
    } else {
      const errorText = await response.text();
      setStatus(`Error: ${errorText}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Invite New Member</h3>
      <div>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value={Role.USER}>User (Policyholder)</option>
          {/* The rendering logic is now controlled by the server-passed prop */}
          {canInviteAgents && <option value={Role.AGENT}>Agent</option>}
        </select>
      </div>
      <button type="submit">Send Invitation</button>
      {status && <p>{status}</p>}
    </form>
  );
}