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

interface PricklyPearUnreadMessagesEmailProps {
  username?: string;
  userImage?: string;
  unreadCount?: number;
  threads?: Array<{
    id: string;
    title: string;
    unreadCount: number;
    lastMessageAt: string;
    participants: string[];
  }>;
  dashboardLink?: string;
}

export const PricklyPearUnreadMessagesEmail = ({
  username,
  unreadCount = 0,
  threads = [],
  dashboardLink,
}: PricklyPearUnreadMessagesEmailProps) => {
  const previewText = `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''} in ${threads.length} thread${threads.length !== 1 ? 's' : ''}`;

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
              You have <strong>{unreadCount}</strong> unread message
              {unreadCount !== 1 ? 's' : ''}
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              Hi <strong>{username}</strong>, you have unread messages waiting
              for you in <strong>The Prickly Pear</strong> platform.
            </Text>

            {threads.length > 0 && (
              <Section className="mt-[24px]">
                <Heading className="mx-0 my-[16px] p-0 font-normal text-[18px] text-black">
                  Threads with unread messages:
                </Heading>
                {threads.map((thread) => (
                  <Section
                    key={thread.id}
                    className="mt-[16px] p-[16px] bg-gray-50 rounded"
                  >
                    <Text className="text-[16px] font-semibold text-black leading-[20px] mb-[8px]">
                      {thread.title}
                    </Text>
                    <Text className="text-[14px] text-gray-600 leading-[18px] mb-[8px]">
                      {thread.unreadCount} unread message
                      {thread.unreadCount !== 1 ? 's' : ''}
                    </Text>
                    <Text className="text-[12px] text-gray-500 leading-[16px] mb-[8px]">
                      With: {thread.participants.join(', ')}
                    </Text>
                    <Text className="text-[12px] text-gray-500 leading-[16px]">
                      Last activity: {thread.lastMessageAt}
                    </Text>
                  </Section>
                ))}
              </Section>
            )}

            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={dashboardLink}
              >
                View Messages
              </Button>
            </Section>

            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={dashboardLink} className="text-blue-600 no-underline">
                {dashboardLink}
              </Link>
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              You're receiving this email because you have unread messages in
              your Prickly Pear account. You can manage your notification
              preferences in your account settings.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PricklyPearUnreadMessagesEmail.PreviewProps = {
  username: 'Amanda',
  unreadCount: 5,
  threads: [
    {
      id: '1',
      title: 'Weekend Plans Discussion',
      unreadCount: 2,
      lastMessageAt: '2 hours ago',
      participants: ['Steve', 'Sarah'],
    },
    {
      id: '2',
      title: 'School Pickup Schedule',
      unreadCount: 3,
      lastMessageAt: '1 day ago',
      participants: ['Steve'],
    },
  ],
  dashboardLink: 'https://prickly.app/threads',
} as PricklyPearUnreadMessagesEmailProps;

export default PricklyPearUnreadMessagesEmail;
