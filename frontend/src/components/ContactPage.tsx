import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage({ onNotify }: { onNotify: (msg: string, type: "success" | "error" | "info") => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify("Message sent! We'll get back to you shortly.", "success");
    setName(""); setEmail(""); setSubject(""); setMessage("");
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-10 text-slate-800">

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Contact Us</h1>
        <p className="text-sm text-slate-500 font-medium">
          Have a question, feedback, or need assistance? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Contact Info */}
        <div className="space-y-5">
          {[
            { icon: <Phone size={18} />, title: "Phone", detail: "+251 91 234 5678", sub: "Mon–Sat, 8AM–6PM" },
            { icon: <Mail size={18} />, title: "Email", detail: "hello@arifcarsell.com", sub: "We reply within 24hrs" },
            { icon: <MapPin size={18} />, title: "Address", detail: "Bole Road, Addis Ababa", sub: "Ethiopia" },
            { icon: <Clock size={18} />, title: "Hours", detail: "Mon–Sat: 8:00 AM – 6:00 PM", sub: "Sunday: Closed" },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">{item.icon}</div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{item.title}</p>
                <p className="text-sm font-bold text-slate-800">{item.detail}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
          <h2 className="font-extrabold text-base border-b border-slate-100 pb-3">Send us a Message</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="How can we help?" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Message *</label>
            <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Tell us more about your inquiry..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none resize-none" />
          </div>

          <button type="submit"
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Send size={15} />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  );
}
