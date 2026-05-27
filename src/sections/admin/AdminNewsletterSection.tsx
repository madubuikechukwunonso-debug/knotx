// src/sections/admin/AdminNewsletterSection.tsx
'use client';

import { useState } from 'react';
import { Mail, Plus, Send, Users, TrendingUp, X, Eye } from 'lucide-react';

interface Contact {
  id: string;
  email: string;
  name: string;
  source: string;
  isActive: boolean;
  joined: Date | string;
  type: 'subscriber' | 'user';
}

interface AdminNewsletterSectionProps {
  subscribers: any[];
  localUsers: any[];
  contacts: Contact[];
  stats: {
    total: number;
    active: number;
    fromHomepage: number;
  };
}

export default function AdminNewsletterSection({ 
  subscribers = [], 
  localUsers = [], 
  contacts = [], 
  stats 
}: AdminNewsletterSectionProps) {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const total = stats?.total || contacts.length;
  const active = stats?.active || contacts.filter(c => c.isActive).length;
  const fromHomepage = stats?.fromHomepage || contacts.filter(c => c.source === 'HOMEPAGE').length;

  // Filtered contacts for the view modal
  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendCampaign = async (formData: FormData) => {
    setSending(true);
    
    try {
      const subject = formData.get('subject') as string;
      const htmlBody = formData.get('htmlBody') as string;

      if (!subject || !htmlBody) {
        alert('Please fill in subject and message');
        setSending(false);
        return;
      }

      const response = await fetch('/api/admin/newsletter/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, htmlBody }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Campaign sent successfully to ${result.recipientCount} recipients!`);
        setShowCampaignModal(false);
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to send campaign: ${error.error}`);
      }
    } catch (error) {
      console.error('Send campaign error:', error);
      alert('Failed to send campaign. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto bg-background text-foreground">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">Newsletter</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} contact{total !== 1 ? 's' : ''} • Registration + Homepage signups
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* VIEW CONTACTS BUTTON */}
          <button
            onClick={() => setShowContactsModal(true)}
            className="flex items-center gap-2 bg-card border border-border hover:bg-muted text-foreground px-6 py-3 rounded-3xl transition-colors"
          >
            <Eye size={20} />
            <span className="font-medium">View Contacts ({total})</span>
          </button>

          {/* SEND CAMPAIGN BUTTON */}
          <button
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-3xl transition-colors shadow-sm"
          >
            <Send size={20} />
            <span className="font-medium">Send New Campaign</span>
          </button>

          {/* ADD SUBSCRIBER BUTTON */}
          <button
            onClick={() => setShowAddSubscriberModal(true)}
            className="flex items-center gap-2 bg-card border border-border hover:bg-muted text-foreground px-6 py-3 rounded-3xl transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-3xl p-6 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Total Contacts</p>
              <p className="text-4xl font-semibold text-foreground mt-2">{total}</p>
            </div>
            <Users className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Active</p>
              <p className="text-4xl font-semibold text-foreground mt-2">{active}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-border md:col-span-1 col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">From Homepage</p>
              <p className="text-xl font-medium text-foreground mt-2">{fromHomepage}</p>
            </div>
            <Mail className="h-10 w-10 text-primary" />
          </div>
        </div>
      </div>

      {/* CONTACTS TABLE */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-6 py-5 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-6 py-5 text-left font-medium text-muted-foreground">Source</th>
                <th className="px-6 py-5 text-left font-medium text-muted-foreground">Joined</th>
                <th className="px-6 py-5 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contacts.slice(0, 20).map((contact) => (
                <tr key={contact.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-5 font-medium text-foreground">{contact.name}</td>
                  <td className="px-6 py-5 text-muted-foreground">{contact.email}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl bg-muted text-foreground">
                      {contact.source}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-muted-foreground text-sm">
                    {new Date(contact.joined).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${contact.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {contact.isActive ? 'ACTIVE' : 'UNSUBSCRIBED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contacts.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground text-lg">No contacts yet</p>
            <p className="text-muted-foreground text-sm mt-2">Subscribers from registration and homepage will appear here</p>
          </div>
        )}
      </div>

      {/* SEND CAMPAIGN MODAL */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-2xl font-serif text-foreground">New Campaign</h2>
                <p className="text-sm text-muted-foreground">Sending to {active} active contacts</p>
              </div>
              <button onClick={() => setShowCampaignModal(false)} className="p-2 hover:bg-muted rounded-full text-foreground">
                <X size={20} />
              </button>
            </div>

            <form action={handleSendCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
                <input 
                  name="subject" 
                  required 
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary text-foreground" 
                  placeholder="Exciting news from Knotx & Krafts!" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Message (HTML supported)</label>
                <textarea 
                  name="htmlBody" 
                  rows={10} 
                  required 
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary text-foreground" 
                  placeholder="<h1>Hello from Knotx & Krafts!</h1><p>We're excited to share...</p>"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCampaignModal(false)} 
                  className="flex-1 py-3 rounded-3xl border border-border text-foreground font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="flex-1 py-3 rounded-3xl bg-primary text-primary-foreground font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>Sending to {active} contacts...</>
                  ) : (
                    <>Send Campaign to {active} Recipients</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CONTACTS MODAL */}
      {showContactsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-2xl font-serif text-foreground">All Contacts ({total})</h2>
                <p className="text-sm text-muted-foreground">Subscribers + Registered Users</p>
              </div>
              <button onClick={() => setShowContactsModal(false)} className="p-2 hover:bg-muted rounded-full text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 border-b border-border">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 border border-border rounded-2xl bg-card">
                    <div>
                      <p className="font-medium text-foreground">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-foreground">
                        {contact.source}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(contact.joined).toLocaleDateString('en-CA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No contacts match your search
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end">
              <button 
                onClick={() => setShowContactsModal(false)}
                className="px-8 py-3 rounded-3xl border border-border text-foreground font-medium hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUBSCRIBER MODAL */}
      {showAddSubscriberModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-2xl font-serif text-foreground">Add New Subscriber</h2>
              <button onClick={() => setShowAddSubscriberModal(false)} className="p-2 hover:bg-muted rounded-full text-foreground">
                <X size={20} />
              </button>
            </div>

            <form action="/api/admin/newsletter/add-subscriber" method="POST" className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary text-foreground" 
                  placeholder="hello@example.com" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Name (optional)</label>
                <input 
                  name="name" 
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary text-foreground" 
                  placeholder="Jane Doe" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Source</label>
                <select 
                  name="source" 
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="MANUAL">Manual Entry</option>
                  <option value="HOMEPAGE">Homepage</option>
                  <option value="REGISTRATION">Registration</option>
                  <option value="CHECKOUT">Checkout</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddSubscriberModal(false)} 
                  className="flex-1 py-3 rounded-3xl border border-border text-foreground font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-3xl bg-primary text-primary-foreground font-medium"
                >
                  Add Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
