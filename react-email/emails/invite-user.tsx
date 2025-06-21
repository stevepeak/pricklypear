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

interface PricklyPearInviteUserEmailProps {
  invitedByName?: string;
  invitedByEmail?: string;
  inviteLink?: string;
}

export const PricklyPearInviteUserEmail = ({
  invitedByName,
  invitedByEmail,
  inviteLink,
}: PricklyPearInviteUserEmailProps) => {
  const previewText = `Join ${invitedByName} on Prickly Pear`;

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
              Join <strong>{invitedByName}</strong> in{' '}
              <strong>The Prickly Pear</strong>
            </Heading>
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[16px] text-black">
              The AI-assisted co-parenting communication platform
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              <strong>{invitedByName}</strong> (
              <Link
                href={`mailto:${invitedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {invitedByEmail}
              </Link>
              ) has invited you to connect on <strong>The Prickly Pear</strong>{' '}
              platform.
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={inviteLink}
              >
                Join The Prickly Pear
              </Button>
            </Section>
            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you were not expecting this invitation, you can ignore this
              email. If you are concerned about your account's safety, please
              reply to this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PricklyPearInviteUserEmail.PreviewProps = {
  invitedByName: 'Steve',
  invitedByEmail: 'steve@prickly.app',
  inviteLink: 'https://prickly.app/...',
} as PricklyPearInviteUserEmailProps;

export default PricklyPearInviteUserEmail;
