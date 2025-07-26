"use client";

import { useState, type FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { Role } from "@prisma/client"; // Using the enum from Prisma as the single source of truth

export function CreateUserForm() {
  // Get the currently signed-in user's data from Clerk
  const { user } = useUser();
  // Determine the role of the person using the form
  const currentUserRole = user?.publicMetadata?.role as Role;

  // State for all form fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleToCreate, setRoleToCreate] = useState<Role>("USER"); // Default to creating a USER

  // State for managing the UI feedback (loading, success, error messages)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the form submission.
   */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/create-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          role: roleToCreate, // Send the selected role to the API
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // If the API returns an error, display it
        throw new Error(result.error || "Failed to send invitation.");
      }

      // On success, show a confirmation message and reset the form
      setSuccess(
        `Invitation for new ${roleToCreate.toLowerCase()} successfully sent to ${email}.`
      );
      setEmail("");
      setFirstName("");
      setLastName("");
      setRoleToCreate("USER"); // Reset dropdown to default
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Invite New User
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Role Selection Dropdown */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            id="role"
            value={roleToCreate}
            onChange={(e) => setRoleToCreate(e.target.value as Role)}
            className="w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {/* An ADMIN can create AGENTs and USERs */}
            {currentUserRole === Role.ADMIN && (
              <option value={Role.AGENT}>Agent</option>
            )}
            {/* Both ADMINs and AGENTs can create USERs */}
            {(currentUserRole === Role.ADMIN ||
              currentUserRole === Role.AGENT) && (
              <option value={Role.USER}>User (Policyholder)</option>
            )}
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </form>

      {/* Feedback Messages */}
      {success && (
        <p className="mt-4 text-sm font-medium text-center text-green-600">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm font-medium text-center text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}