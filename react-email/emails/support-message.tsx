import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface PricklyPearSupportMessageEmailProps {
  userName?: string;
  userEmail?: string;
  threadTitle?: string;
  threadId?: string;
  messageText?: string;
  dashboardLink?: string;
}

export const PricklyPearSupportMessageEmail = ({
  userName,
  userEmail,
  threadTitle,
  threadId,
  messageText,
  dashboardLink,
}: PricklyPearSupportMessageEmailProps) => {
  const previewText = `New support message from ${userName}`;
  const threadLink = dashboardLink || `https://prickly.app/threads/${threadId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src="https://prickly.app/public/logo.png"
                width="40"
                height="37"
                alt="Prickly Pear"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
              New Support Message
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              <strong>{userName}</strong> ({userEmail}) sent a message in
              support thread:
            </Text>

            <Section className="mt-[24px] mb-[24px]">
              <Text className="text-[16px] font-semibold text-black leading-[20px] mb-[12px]">
                {threadTitle}
              </Text>
              <Section className="p-[16px] bg-gray-50 rounded">
                <Text className="text-[14px] text-gray-800 leading-[22px] whitespace-pre-wrap">
                  {messageText}
                </Text>
              </Section>
            </Section>

            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={threadLink}
              >
                View and Reply
              </Button>
            </Section>

            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={threadLink} className="text-blue-600 no-underline">
                {threadLink}
              </Link>
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              You're receiving this email because you're an admin for The
              Prickly Pear platform. This is a customer support notification.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PricklyPearSupportMessageEmail.PreviewProps = {
  userName: 'Amanda Johnson',
  userEmail: 'amanda@example.com',
  threadTitle: 'Help with calendar sync',
  threadId: '123e4567-e89b-12d3-a456-426614174000',
  messageText:
    "Hi, I'm having trouble syncing my calendar with the app. When I try to add an event, it doesn't appear in my Google Calendar. Can you help me troubleshoot this issue?",
  dashboardLink:
    'https://prickly.app/threads/123e4567-e89b-12d3-a456-426614174000',
} as PricklyPearSupportMessageEmailProps;

export default PricklyPearSupportMessageEmail;
