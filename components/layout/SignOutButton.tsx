"use client";

import React, { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export const SignOutButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logoutAction();
    } catch (error) {
      // Ignore Next.js internal redirect error so navigation proceeds smoothly
      if (
        error instanceof Error &&
        (error.message === "NEXT_REDIRECT" ||
          (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
      ) {
        return;
      }
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="text-sm py-1"
        onClick={() => setIsOpen(true)}
      >
        Sign Out
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isSigningOut && setIsOpen(false)}
        title="Confirm Sign Out"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Are you sure you want to sign out? You will need to sign back in to
            access your dashboard.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="text-sm"
              onClick={() => setIsOpen(false)}
              disabled={isSigningOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="text-sm"
              onClick={handleConfirmSignOut}
              isLoading={isSigningOut}
            >
              Yes, Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
