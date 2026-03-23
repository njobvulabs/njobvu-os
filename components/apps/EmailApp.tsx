import React, { useState } from 'react';
import { Mail, Star, Send, Trash2, Edit2, Search, Inbox, AlertCircle } from 'lucide-react';
import { useOS } from '../../context/OSContext';

const MOCK_EMAILS = [
  { id: 1, from: "Team Njobvu", subject: "Welcome to Njobvu OS", preview: "Hi there! Welcome to your new web-based operating system...", time: "10:30 AM", unread: true },
  { id: 2, from: "Security Alert", subject: "New sign-in detected", preview: "We detected a new login from Chrome on Windows...", time: "Yesterday", unread: false },
  { id: 3, from: "Newsletter", subject: "Weekly Tech Digest", preview: "Here are the top stories for this week in tech...", time: "Monday", unread: false },
];

export const EmailApp: React.FC = () => {
  const { addNotification } = useOS();
  const [selectedMail, setSelectedMail] = useState<number | null>(1);
  const [composing, setComposing] = useState(false);

  const sendEmail = () => {
    setComposing(false);
    addNotification("Mail", "Email sent successfully", "success");
  };

  return (
    <div className="flex h-full bg-white text-gray-800">
      {/* Sidebar */}
      <div className="w-48 bg-gray-100 flex flex-col p-2 gap-1 border-r border-gray-200">
        <button 
          onClick={() => setComposing(true)}
          className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 mb-4 hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Edit2 size={16} /> Compose
        </button>
        <NavButton icon={<Inbox size={16} />} label="Inbox" count={1} active />
        <NavButton icon={<Star size={16} />} label="Starred" />
        <NavButton icon={<Send size={16} />} label="Sent" />
        <NavButton icon={<AlertCircle size={16} />} label="Spam" />
        <NavButton icon={<Trash2 size={16} />} label="Trash" />
      </div>

      {/* Mail List */}
      <div className="w-72 border-r border-gray-200 flex flex-col bg-white">
         <div className="p-3 border-b border-gray-200">
            <div className="relative">
               <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
               <input className="w-full bg-gray-100 rounded pl-8 pr-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Search mail" />
            </div>
         </div>
         <div className="flex-1 overflow-y-auto">
            {MOCK_EMAILS.map(mail => (
               <div 
                 key={mail.id} 
                 onClick={() => { setSelectedMail(mail.id); setComposing(false); }}
                 className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedMail === mail.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''} ${mail.unread ? 'font-semibold' : ''}`}
               >
                  <div className="flex justify-between text-xs mb-1">
                     <span className="truncate">{mail.from}</span>
                     <span className="text-gray-500">{mail.time}</span>
                  </div>
                  <div className="text-sm mb-1 truncate">{mail.subject}</div>
                  <div className="text-xs text-gray-500 truncate">{mail.preview}</div>
               </div>
            ))}
         </div>
      </div>

      {/* Reading Pane / Compose */}
      <div className="flex-1 flex flex-col bg-gray-50">
         {composing ? (
            <div className="p-8 flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
               <h2 className="text-xl font-bold mb-4">New Message</h2>
               <input className="border-b p-2 mb-2 bg-transparent outline-none" placeholder="To" />
               <input className="border-b p-2 mb-4 bg-transparent outline-none" placeholder="Subject" />
               <textarea className="flex-1 bg-white p-4 rounded-lg shadow-sm resize-none outline-none mb-4" placeholder="Type your message..." />
               <div className="flex justify-end gap-2">
                  <button onClick={() => setComposing(false)} className="px-4 py-2 hover:bg-gray-200 rounded">Discard</button>
                  <button onClick={sendEmail} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
               </div>
            </div>
         ) : selectedMail ? (
            <div className="p-6 h-full flex flex-col">
               {(() => {
                  const mail = MOCK_EMAILS.find(m => m.id === selectedMail);
                  return mail ? (
                    <>
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <h2 className="text-xl font-bold mb-1">{mail.subject}</h2>
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{mail.from[0]}</div>
                                <div>
                                   <div className="text-sm font-bold">{mail.from}</div>
                                   <div className="text-xs text-gray-500">to me</div>
                                </div>
                             </div>
                          </div>
                          <span className="text-xs text-gray-500">{mail.time}</span>
                       </div>
                       <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-sm leading-relaxed">
                          <p>Hi there,</p>
                          <br/>
                          <p>{mail.preview}</p>
                          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ac venenatis tellus. Duis et aliquam orci.</p>
                          <br/>
                          <p>Best Regards,</p>
                          <p>{mail.from}</p>
                       </div>
                       <div className="mt-4 flex gap-2">
                          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Reply</button>
                          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Forward</button>
                       </div>
                    </>
                  ) : <div>Mail not found</div>
               })()}
            </div>
         ) : (
            <div className="flex items-center justify-center h-full text-gray-400">Select an email to read</div>
         )}
      </div>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, count?: number, active?: boolean }> = ({ icon, label, count, active }) => (
  <button className={`w-full text-left px-3 py-2 rounded flex items-center justify-between text-sm ${active ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-200 text-gray-600'}`}>
     <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
     </div>
     {count && <span className="text-xs font-bold">{count}</span>}
  </button>
);