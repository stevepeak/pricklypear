/** @jsxImportSource npm:react */
import React from "npm:react";
import { Text, Link } from "npm:@react-email/components";
import { BaseTemplate } from "./BaseTemplate.tsx";

const APP_URL = "https://prickly.app";

export interface InvitationEmailProps {
  inviterName: string;
  recipientEmail: string;
  isExistingUser: boolean;
}

export function InvitationEmail(props: InvitationEmailProps) {
  const { inviterName, recipientEmail, isExistingUser } = props;

  const ctaHref = isExistingUser
    ? `${APP_URL}/connections`
    : `${APP_URL}/auth?email=${encodeURIComponent(
        recipientEmail,
      )}&inviterName=${encodeURIComponent(inviterName)}`;

  const ctaText = isExistingUser ? "Visit your connections" : "Create an account";

  return (
    <BaseTemplate>
      <Text style={{ marginBottom: "16px" }}>Hi there,</Text>

      <Text style={{ marginBottom: "16px" }}>
        <strong>{inviterName}</strong>{" "}
        {isExistingUser
          ? "has invited you to connect on The Prickly Pear."
          : "has invited you to join The Prickly Pear."}
      </Text>

      <Text style={{ marginBottom: "16px" }}>
        <Link href={ctaHref}>{ctaText}</Link>{" "}
        {isExistingUser
          ? "to accept the request."
          : `to start the conversation with ${inviterName}.`}
      </Text>

      <Text style={{ marginTop: "32px" }}>Best,</Text>
      <Text>The Prickly Pear</Text>
    </BaseTemplate>
  );
}
