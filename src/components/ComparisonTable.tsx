import React from 'react';

const ComparisonTable = () => {
  const features = [
    {
      feature: 'Real-time messaging',
      pricklyPear: '✅',
      talkingParents: '✅',
      civilCommunicator: '❌ (delay for moderation)',
      ourFamilyWizard: '✅',
    },
    {
      feature: 'AI message mediation',
      pricklyPear: '✅',
      talkingParents: '❌',
      civilCommunicator: '❌',
      ourFamilyWizard: '⚠️ (ToneMeter only)',
    },
    {
      feature: 'Chat with AI about docs & calendar events',
      pricklyPear: '✅',
      talkingParents: '❌',
      civilCommunicator: '❌',
      ourFamilyWizard: '❌',
    },
    {
      feature: 'Flat pricing with free guest/child accounts',
      pricklyPear: '✅',
      talkingParents: '❌',
      civilCommunicator: '❌',
      ourFamilyWizard: '⚠️ (Some free limited accounts)',
    },
    {
      feature: 'Customer Feedback',
      pricklyPear: 'Zen 🧘‍♂️',
      talkingParents: 'Ads 🤮 and poor search 🤷',
      civilCommunicator: 'Human review is soooo slow 🐌',
      ourFamilyWizard: 'Built in the 90s. Slow, buggy, and outdated 🧌',
    },
    {
      feature: 'Built in',
      pricklyPear: '2025! 🚀 w/ AI and new tech',
      talkingParents: '10 years ago...',
      civilCommunicator: '6 years ago...',
      ourFamilyWizard: 'over 20 years ago! 👵',
    },
    {
      feature: 'Invite family, kids, and professionals to conversations',
      pricklyPear: '✅',
      talkingParents: '❌',
      civilCommunicator: '⚠️ (Read-only guests only)',
      ourFamilyWizard: '✅',
    },
    {
      feature: 'AI helps de-escalate conflict live',
      pricklyPear: '✅',
      talkingParents: '❌',
      civilCommunicator: '❌ (Human moderators only)',
      ourFamilyWizard: '⚠️ (ToneMeter helps sender only)',
    },
    {
      feature: 'Moderated communication for legal backup',
      pricklyPear: '✅',
      talkingParents: '✅',
      civilCommunicator: '✅',
      ourFamilyWizard: '✅',
    },
    {
      feature: 'Court-friendly message records',
      pricklyPear: '✅',
      talkingParents: '✅',
      civilCommunicator: '✅',
      ourFamilyWizard: '✅',
    },
    {
      feature: 'Shared calendar',
      pricklyPear: '✅',
      talkingParents: '⚠️ (no iCal/Google Calendar integration)',
      civilCommunicator: '✅',
      ourFamilyWizard: '✅',
    },
    {
      feature: 'Affordable primary parent pricing',
      pricklyPear: '✅ $15/m',
      talkingParents: '⚠️ $12–27/m',
      civilCommunicator: '❌ $33–65/m',
      ourFamilyWizard: '⚠️ $12–25/m',
    },
  ];

  const renderStatus = (status: string) => {
    if (status.includes('✅')) {
      return <span className="text-green-600 font-semibold">{status}</span>;
    } else if (status.includes('❌')) {
      return <span className="text-red-600 font-semibold">{status}</span>;
    } else if (status.includes('⚠️')) {
      return <span className="text-yellow-600 font-semibold">{status}</span>;
    }
    return <span className="text-gray-700">{status}</span>;
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#7C4A03] mb-4">
            How Prickly Pear Compares
          </h2>
          <p className="text-lg text-[#7C4A03]/80 max-w-3xl mx-auto">
            See how our AI-powered platform stands out from traditional
            co-parenting apps
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[#E2B07A] rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-[#FFF8F0]">
                <th className="border border-[#E2B07A] p-4 text-left font-semibold text-[#7C4A03] min-w-[200px]">
                  Feature
                </th>
                <th className="border border-[#E2B07A] p-4 text-center font-semibold text-[#7C4A03] bg-[#F7C873]/20">
                  Prickly Pear
                </th>
                <th className="border border-[#E2B07A] p-4 text-center font-semibold text-[#7C4A03]">
                  Talking Parents
                </th>
                <th className="border border-[#E2B07A] p-4 text-center font-semibold text-[#7C4A03]">
                  Civil Communicator
                </th>
                <th className="border border-[#E2B07A] p-4 text-center font-semibold text-[#7C4A03]">
                  OurFamilyWizard
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#FFF8F0]/50'}
                >
                  <td className="border border-[#E2B07A] p-4 font-medium text-[#7C4A03]">
                    {row.feature}
                  </td>
                  <td className="border border-[#E2B07A] p-4 text-center bg-[#F7C873]/10">
                    {renderStatus(row.pricklyPear)}
                  </td>
                  <td className="border border-[#E2B07A] p-4 text-center">
                    {renderStatus(row.talkingParents)}
                  </td>
                  <td className="border border-[#E2B07A] p-4 text-center">
                    {renderStatus(row.civilCommunicator)}
                  </td>
                  <td className="border border-[#E2B07A] p-4 text-center">
                    {renderStatus(row.ourFamilyWizard)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#7C4A03]/60">
            * Pricing and features are based on publicly available information
            and may change
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
