import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";

// Form field component matching the exact rounded rectangle style in the PDF
const FormField = ({ label, value }: { label: string, value: string }) => (
  <div className="flex items-center mb-[9px]">
    <label className="w-[180px] sm:w-[220px] shrink-0 text-[13px] font-medium text-[#2d3748]">
      {label}
    </label>
    <div className="flex-1 h-[26px] border border-[#a0aec0] rounded-[6px] bg-white px-2 flex items-center text-[13px] font-medium text-[#1a202c]">
      {value}
    </div>
  </div>
);

// Malayalam Rules Item using the precise diamond/clover character
const RuleItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-[8px] mb-[8px]">
    <span className="text-[14px] leading-none mt-[3px] text-gray-800">❖</span>
    <p className="text-[13px] leading-[1.6] text-gray-800 text-justify">{text}</p>
  </li>
);

export default async function PrintApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const application = await prisma.application.findUnique({
    where: { id: resolvedParams.id },
    include: { course: true }
  });

  if (!application) {
    notFound();
  }

  const data = (application.data as Record<string, any>) || {};

  // Extract data fields with fallbacks
  const getField = (key: string) => data[key] || "";

  let photoSrc = getField("photo");
  if (photoSrc && photoSrc.startsWith("http")) {
    try {
      const res = await fetch(photoSrc);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        photoSrc = `data:${contentType};base64,${base64}`;
      }
    } catch (e) {
      console.error("Failed to fetch photo for print preview:", e);
    }
  }

  const rules = [
    "അൽവർദ ഒരു ഇസ്ലാമിക വനിതാ കലാലയമാണ്. രക്ഷിതാക്കളും വിദ്യാർഥിനികളും ഇസ്ലാമിക സംസ് കാരത്തിലായിരിക്കണം സ്ഥാപനത്തോടും അധികൃതരോടും സമീപിക്കേണ്ടത്.",
    "രക്ഷിതാക്കൾ അത്യാവശ്യങ്ങൾക്ക് സ്ഥാപനത്തിൽ വരികയാണെങ്കിൽ ഓഫീസുമായി ബന്ധപ്പെടുക, ക്ലാസ് റൂമുകളിലേക്ക് പ്രവേശനമില്ല.",
    "അഡ്മിഷൻ സമയത്ത് യോഗ്യതാ സർട്ടിഫിക്കറ്റുകൾ സ്ഥാപനത്തിൽ ഏൽപ്പിക്കേണ്ടതാണ്. കോഴ്സ് ഫീ മുഴുവൻ അടച്ച ശേഷം രക്ഷിതാക്കളുടെ കൈവശം മാത്രമേ തിരിച്ചു നൽകുകയൊള്ളൂ.",
    "അച്ചടക്ക ലംഘനം കാരണമായി പുറത്താക്കപ്പെട്ടവരാണെങ്കിലും പ്രസ്തുത വർഷത്തെ കോഴ്സ് ഫീ മുഴുവനായും അടക്കാൻ ബാധ്യസ്ഥരാണ്.",
    "ഘഡുക്കളായി അടക്കാൻ നിശ്ചയിച്ച തിയ്യതിക്ക് മുമ്പ് നിർബന്ധമായും ഫീ അടക്കേണ്ടതാണ്.",
    "റജിസ്റ്ററേഷൻ, അഡ്മിഷൻ, എക്സാം, ടെക്സ്റ്റ് ബുക്ക്, യൂണിഫോം തുടങ്ങിയ ഫീസുകൾ കോഴ്സ് ഫീയിൽ ഉൾപ്പെടുന്നതല്ല.",
    "ക്ലാസ് ആരംഭിക്കുന്നതിൻ്റെ പത്ത് മിനുട്ട് മുമ്പ് വിദ്യാർഥിനികൾ സ്ഥാപനത്തിൽ എത്തേണ്ടതാണ്.",
    "അറ്റൻഡൻസ് നിർബന്ധമാണ്. അത്യാവശ്യ ലീവുകൾ രക്ഷിതാക്കൾ മുൻകൂട്ടി അറിയിക്കേണ്ടതാണ്.",
    "വിദ്യാർഥിനികൾ എല്ലാ ദിവസവും യൂണിഫോം ധരിച്ച് വരേണ്ടതാണ്.",
    "കാമ്പസിനകത്ത് മൊബൈൽ ഫോൺ നിരോധിച്ചിരിക്കുന്നു. നിയമം തെറ്റിക്കുന്നവരിൽ നിന്ന് 500 രൂപ ഫൈനോട് കൂടി രക്ഷിതാക്കളുടെ കൈവശം മാത്രമേ ഫോൺ തിരികെ നൽകുകയൊള്ളൂ. മറ്റു നടപടികൾ എടുക്കാൻ സ്ഥാപന മേധാവിക്ക് അധികാരം ഉണ്ടായിരിക്കുന്നതാണ്.",
    "സ്ഥാപനത്തിൻ്റെ ഫർണ്ണിച്ചറുകൾ മറ്റു സാമഗ്രികൾ എന്നിവ നശിപ്പിക്കുന്നവർക്കെതിരെ കർശന നടപടി സ്വീകരിക്കുന്നതാണ്.",
    "സ്ഥാപനത്തിൽ പാലിക്കേണ്ട മര്യാദകൾ പാലിക്കാൻ വിദ്യാർഥിനികൾ ബാധ്യസ്ഥരാണ്. അച്ചടക്കം ലംഘിക്കുന്നവർക്കെതിരെ നടപടി എടുക്കാൻ സ്ഥാപന മേധാവിക്ക് പൂർണ്ണ അധികാരം ഉണ്ടായിരിക്കുന്നതാണ്."
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
      <div className="min-h-screen bg-gray-300 py-8 print:py-0 print:bg-white text-black font-sans flex flex-col items-center">

        {/* Floating Print Button */}
        <div className="fixed bottom-8 right-8 print:hidden z-50">
          <button
            id="manual-print-btn"
            className="bg-[#1b4ca1] hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print Form
          </button>
        </div>

        {/* --- PAGE 1 --- */}
        <div className="w-[210mm] h-[297mm] bg-[#f9f9f9] shadow-2xl print:shadow-none mb-12 print:mb-0 relative flex flex-col box-border overflow-hidden border border-gray-800 print:border-none">

          {/* Blue Header Section */}
          <header className="bg-[#16439e] h-[160px] w-full relative flex items-center px-[30px]">
            {/* Diagonal background accent overlay effect exactly like the image */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute top-0 left-0 w-[40%] h-full bg-[#1b50b5] opacity-80"
                style={{ clipPath: 'polygon(0 0, 100% 0, 40% 100%, 0 100%)' }}
              ></div>
              <div
                className="absolute top-0 left-0 w-[20%] h-full bg-[#123680] opacity-60"
                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              ></div>
            </div>

            <div className="flex items-center gap-5 relative z-10 w-full pt-[10px] ml-[10px]">
              {/* Logo Recreation */}
              <div className="w-[100px] h-[100px] bg-white rounded-[10px] shadow-sm flex flex-col items-center justify-center p-2 border border-gray-300">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={120}
                  height={120}
                  className="mb-1"
                />
              </div>

              {/* Header Text */}
              <div className="flex flex-col text-white pb-2">
                <h2 className="text-[26px] leading-[1.1] font-bold tracking-wide">AL-WARDA</h2>
                <h1 className="text-[32px] leading-[1.1] font-extrabold tracking-wide">WOMEN'S COLLEGE</h1>
                <p className="text-[13px] font-medium mt-1">Mifthahul Huda Campus, SS Road VENGARA</p>
                <p className="text-[13px] font-medium">Phone: 9061 2000 23, 9061 2000 24</p>
              </div>
            </div>

            {/* Photo Box */}
            <div className="absolute right-[45px] top-[33px] w-[145px] h-[180px] bg-white border border-[#a0aec0] rounded-[6px] shadow-sm z-20 overflow-hidden flex items-center justify-center">
              {photoSrc ? (
                <img src={photoSrc} alt="Applicant Photo" className="w-full h-full object-cover" />
              ) : null}
            </div>
          </header>

          {/* Application Title Row */}
          <div className="flex justify-start gap-[14px] px-[35px] mt-[25px] mb-[20px] ml-[10px]">
            <div className="w-[140px] h-[32px] border border-[#a0aec0] rounded-[6px] bg-white flex items-center justify-center font-bold text-[#2d3748] text-sm">
              {application.applicationNo}
            </div>
            <div className="bg-[#e8b62c] text-[#12316e] font-extrabold text-[16px] px-[70px] py-[4px] rounded-[6px] flex items-center shadow-sm">
              APPLICATION FOR ADMISSION
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 px-[45px] flex flex-col mt-[5px]">
            <FormField label="Full Name" value={getField("full_name")} />
            <FormField label="Date of Birth" value={getField("dob") || application.dob.toISOString().split('T')[0]} />
            <FormField label="Name of Father" value={getField("father_name")} />
            <FormField label="Name of Mother" value={getField("mother_name")} />
            <FormField label="Mobile Number (Mother)" value={getField("mother_mobile")} />
            <FormField label="Name of Guardian" value={getField("guardian_name")} />
            <FormField label="Relation with Guardian" value={getField("guardian_relation")} />
            <FormField label="Guardian's Mobile Number" value={getField("guardian_mobile")} />
            <FormField label="House Name of Student" value={getField("house_name")} />
            <FormField label="Place" value={getField("place")} />
            <FormField label="Post Office" value={getField("post_office")} />
            <FormField label="District" value={getField("district")} />
            <FormField label="Whatsapp Number" value={getField("whatsapp_number")} />
            <FormField label="Marital Status" value={getField("marital_status")} />

            {/* Academic Background Banner */}
            <div className="bg-[#e8b62c] text-[#12316e] font-bold text-[15px] text-center py-[5px] rounded-[6px] my-[6px] shadow-sm">
              Academic Background
            </div>

            <FormField label="Madrasa Qualification" value={getField("madrasa_qualification")} />
            <FormField label="Last School Name" value={getField("last_school_name")} />
            <FormField label="SSLC/HSE Reg. Number" value={getField("sslc_hse_reg_number")} />
            <FormField label="Course Selected" value={application.course?.title || getField("course_selected")} />
            {getField("sub_course") && (
              <FormField label="Sub Course" value={getField("sub_course")} />
            )}
            <FormField label="Remarks" value={getField("remarks")} />

            {/* Footer Note */}
            <div className="mt-[50px] mb-[25px] px-[10px] text-center">
              <p className="text-[#de4b6f] italic text-[14px] leading-tight font-medium font-serif">
                Note: Candidate have to appear in person at the institution intending to take admission and<br />
                confirm the admission along with the PDF printout of the application form, along with the<br />
                eligibility certificates and admission fee.
              </p>
            </div>
          </div>
        </div>

        {/* Page Break for Printing */}
        <div className="break-before-page print:block hidden"></div>

        {/* --- PAGE 2 --- */}
        <div className="w-[210mm] h-[297mm] bg-white shadow-2xl print:shadow-none relative box-border flex flex-col border-t-[14px] border-b-[14px] border-[#1073c1] border-x border-x-gray-800 print:border-x-0">

          <div className="px-[50px] pt-[35px] flex-grow flex flex-col">
            {/* Malayalam Rules Section */}
            <h3 className="text-[17px] font-bold text-center mb-[25px]">സ്ഥാപന നിയമങ്ങൾ</h3>

            <ul className="space-y-[4px]">
              {rules.map((rule, index) => (
                <RuleItem key={index} text={rule} />
              ))}
            </ul>

            {/* Student Declaration */}
            <p className="text-center font-bold text-[13px] mt-[35px] text-gray-800">
              മേൽ പ്രസ്താവിച്ച നിയമങ്ങൾ അംഗീകരിച്ച് ഇവിടെ പഠിക്കാൻ തയ്യാറാണ്
            </p>

            {/* Signatures Top */}
            <div className="flex justify-between mt-[60px] px-[20px]">
              <div className="flex flex-col text-[13px] text-gray-700">
                <span>വിദ്യാർത്ഥിനിയുടെ പേര്, ഒപ്പ്</span>
                <span className="mt-1">സ്ഥലം : <span className="font-medium text-[#1a202c] ml-1">{getField("place")}</span></span>
              </div>
              <div className="flex flex-col text-[13px] text-gray-700 w-[180px]">
                <span>രക്ഷിതാവിൻ്റെ പേര്, ഒപ്പ്</span>
                <span className="mt-1">തിയ്യതി : <span className="font-medium text-[#1a202c] ml-1">{new Date(application.createdAt).toLocaleDateString('en-GB')}</span></span>
              </div>
            </div>

            {/* Line Separator */}
            <hr className="border-t border-black mt-[25px] mx-[-15px]" />

            {/* FOR OFFICE USE ONLY BLOCK */}
            <div className="flex flex-col pt-[10px] pb-[40px] px-[5px]">
              <h4 className="text-center text-[#ff0000] font-bold underline text-[15px] tracking-wide mb-[35px] font-serif">
                FOR OFFICE USE ONLY
              </h4>

              {/* Dotted Form Line 1 */}
              <div className="flex items-end mb-[22px] text-[14.5px] font-serif">
                <span className="">Ad.No:</span>
                <div className="flex-1 border-b-[1.5px] border-dotted border-black mb-[4px] ml-1 mr-2"></div>
                <span className="">Name:</span>
                <div className="flex-[3] border-b-[1.5px] border-dotted border-black mb-[4px] ml-1 mr-2"></div>
                <span className="">Class:</span>
                <div className="w-[60px] border-b-[1.5px] border-dotted border-black mb-[4px] ml-1 mr-2"></div>
                <span className="">Division:</span>
                <div className="w-[60px] border-b-[1.5px] border-dotted border-black mb-[4px] ml-1"></div>
              </div>

              {/* Documents Received Line */}
              <div className="flex items-start mb-[22px] text-[14.5px] font-serif">
                <span className="whitespace-nowrap mr-3 mt-[1px]">Documents Received:</span>
                <span className="font-bold tracking-wide text-[13.5px]">
                  SSLC / Plus Two / TC / CC / Mark list / BC Copy / Aadhaar Copy
                </span>
              </div>

              {/* Fees Line */}
              <div className="flex justify-between items-end mb-[50px] text-[14.5px] font-serif font-bold">
                <span>Total Course Fee:</span>
                <span className="pl-[20px]">Fee Paid:</span>
                <span className="pl-[40px]">Receipt No & Date:</span>
              </div>

              {/* Bottom Signatures */}
              <div className="flex justify-between text-[14.5px] font-serif">
                <span>Office In-Charge</span>
                <span className="mr-[140px]">Principal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-print script */}
        <script dangerouslySetInnerHTML={{
          __html: `
        window.onload = function() { window.print(); }
        var btn = document.getElementById('manual-print-btn');
        if(btn) btn.onclick = function() { window.print(); }
      ` }} />
      </div>
    </>
  );
}
