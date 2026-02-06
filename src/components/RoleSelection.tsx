import React, { useState } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface RoleSelectionProps {
  onBack: () => void;
  onSelectRole: (role: string, jd: string) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onBack, onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');

  const roles = [
    { title: 'Custom Job Description', jd: '' },
    { title: 'Business Analyst', jd: 'Job Title: Business Analyst\n\nRole Summary: We are looking for a Business Analyst to join our organizational development team. You will be responsible for bridge the gap between IT and the business using data analytics to assess processes, determine requirements and deliver data-driven recommendations.\n\nResponsibilities:\n- Analyze business needs and document requirements.\n- Create detailed reports and presentations for stakeholders.\n- Monitor project progress and ensure alignment with business goals.\n- Identification of operational efficiencies.' },
    { title: 'Product Manager', jd: 'Job Title: Product Manager\n\nRole Summary: We are seeking a visionary Product Manager to lead the development of our core products. You will work at the intersection of business, technology, and user experience to deliver products that solve real problems.\n\nResponsibilities:\n- Define product vision and roadmap.\n- Work closely with engineering and design teams.\n- Conduct market research and competitor analysis.\n- Prioritize features based on customer feedback and business impact.' },
    { title: 'Software Engineer', jd: 'Job Title: Software Engineer\n\nRole Summary: We are looking for a Software Engineer to join our diverse and dedicated team. This position is an excellent opportunity for those seeking to grow their skills and experience in software development while working on projects with significant impact.\n\nResponsibilities:\n- Develop and implement new software solutions.\n- Collaborate with teams to understand objectives, design features, and meet specific requirements.\n- Improve and maintain existing software to ensure strong functionality and optimization.\n- Recommend changes to existing software applications, as necessary, to ensure excellent functionality.\n- Write efficient, secure, well-documented, and clean JavaScript code.\n- Participate in all phases of the development life cycle.\n\nRequirements:\n- Degree in Computer Science or related field.\n- 0-3 years of experience in software development.\n- Demonstrated problem-solving abilities and attention to detail.\n- Proficiency with at least one programming language.\n- Familiarity with various operating systems and platforms.\n- Good understanding of software development principles.\n- Excellent communication and teamwork skills.\n- Demonstrated ability to manage and prioritize tasks independently.' },
    { title: 'Marketing Specialist', jd: 'Job Title: Marketing Specialist\n\nRole Summary: We are looking for a creative Marketing Specialist to join our marketing team. You will be responsible for developing and implementing marketing strategies to increase brand awareness and drive traffic.\n\nResponsibilities:\n- Develop marketing campaigns.\n- Manage social media platforms.\n- Analyze campaign performance.\n- Collaborate with design and content teams.' },
    { title: 'Data Analyst', jd: 'Job Title: Data Analyst\n\nRole Summary: We are looking for a Data Analyst to join our data team. You will be responsible for collecting, analyzing, and interpreting complex data sets to help our business make better decisions.\n\nResponsibilities:\n- Collect and clean data from various sources.\n- Create data visualizations and reports.\n- Identify trends and patterns in data.\n- Present findings to stakeholders.' },
    { title: 'Customer Service Representative', jd: 'Job Title: Customer Service Representative\n\nRole Summary: We are looking for a Customer Service Representative to join our support team. You will be responsible for providing excellent customer service and resolving customer issues.\n\nResponsibilities:\n- Respond to customer inquiries via phone, email, and chat.\n- Resolve customer complaints and issues.\n- Provide information about our products and services.\n- Maintain customer records.' },
    { title: 'Sales Representative', jd: 'Job Title: Sales Representative\n\nRole Summary: We are looking for a Sales Representative to join our sales team. You will be responsible for generating leads, building relationships with customers, and closing sales.\n\nResponsibilities:\n- Generate leads through various channels.\n- Build and maintain relationships with customers.\n- Present products and services to potential customers.\n- Negotiate and close sales.' },
    { title: 'Human Resources Specialist', jd: 'Job Title: Human Resources Specialist\n\nRole Summary: We are looking for an HR Specialist to join our HR team. You will be responsible for various HR tasks, including recruiting, onboarding, and employee relations.\n\nResponsibilities:\n- Manage the recruiting process.\n- Conduct employee orientation and onboarding.\n- Handle employee relations and conflict resolution.\n- Maintain employee records.' },
    { title: 'UX/UI Designer', jd: 'Job Title: UX/UI Designer\n\nRole Summary: We are looking for a UX/UI Designer to join our design team. You will be responsible for creating intuitive and visually appealing user interfaces for our products.\n\nResponsibilities:\n- Create wireframes, mockups, and prototypes.\n- Conduct user research and testing.\n- Collaborate with product and engineering teams.\n- Design consistent and accessible user interfaces.' },
    { title: 'QA Engineer', jd: 'Job Title: QA Engineer\n\nRole Summary: We are looking for a QA Engineer to join our engineering team. You will be responsible for ensuring the quality of our software through manual and automated testing.\n\nResponsibilities:\n- Develop and execute test plans and test cases.\n- Identify and report software bugs and issues.\n- Perform regression testing.\n- Collaborate with engineering teams to resolve quality issues.' }
  ];

  const currentJD = roles.find(r => r.title === selectedRole)?.jd || '';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in font-sans">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Select a job description</h1>
        <p className="text-slate-500 font-medium">Choose a role to generate a tailored job description for your practice.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {roles.map((role) => (
          <button
            key={role.title}
            onClick={() => setSelectedRole(role.title)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${selectedRole === role.title
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-md shadow-emerald-500/10'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
          >
            {role.title}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl elevation-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-8 flex-1">
          {selectedRole === 'Custom Job Description' ? (
            <textarea
              className="w-full h-full min-h-[300px] p-6 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-medium leading-relaxed resize-none"
              placeholder="Paste your custom job description here..."
            ></textarea>
          ) : (
            <div className="w-full h-full min-h-[300px] p-8 bg-slate-50 rounded-2xl border border-slate-100 overflow-y-auto max-h-[500px]">
              <div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed text-sm">
                {currentJD}
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => onSelectRole(selectedRole, currentJD)}
            className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 group"
          >
            Confirm & Start Practice
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
