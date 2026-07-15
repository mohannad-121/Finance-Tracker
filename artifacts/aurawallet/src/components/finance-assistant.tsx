import { useMemo, useState, type FormEvent } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { useStorageData } from '@/lib/use-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatJOD } from '@/lib/currency';

type Message = { from: 'bot' | 'user'; text: string };
const money = formatJOD;

export function FinanceAssistant() {
  const { walletBalance, spending, categories, walletTransactions, owed } = useStorageData();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ from: 'bot', text: 'Hi! Ask me about your balance, spending, categories, transactions, or money owed.' }]);

  const facts = useMemo(() => {
    const now = new Date();
    const monthSpending = spending.filter(s => { const d = new Date(s.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const byCategory = categories.map(category => ({ name: category.name, amount: spending.filter(s => s.categoryId === category.id).reduce((sum, s) => sum + s.amount, 0) })).sort((a, b) => b.amount - a.amount);
    return {
      monthTotal: monthSpending.reduce((sum, s) => sum + s.amount, 0),
      allSpent: spending.reduce((sum, s) => sum + s.amount, 0),
      top: byCategory[0],
      outstanding: owed.filter(o => !o.isPaid).reduce((sum, o) => sum + o.amount, 0),
      unpaid: owed.filter(o => !o.isPaid),
    };
  }, [spending, categories, owed]);

  function answer(question: string) {
    const q = question.toLowerCase();
    if (q.includes('balance') || q.includes('wallet')) return `Your current wallet balance is ${money(walletBalance)}. This is your self-recorded cash balance, not a bank or card balance.`;
    if (q.includes('owe') || q.includes('owed') || q.includes('debt')) return facts.unpaid.length ? `${facts.unpaid.length} unpaid record${facts.unpaid.length === 1 ? '' : 's'} total ${money(facts.outstanding)}: ${facts.unpaid.slice(0, 4).map(o => `${o.personName} (${money(o.amount)})`).join(', ')}.` : 'You have no outstanding money-owed records.';
    if (q.includes('categor') || q.includes('most') || q.includes('top')) return facts.top?.amount ? `Your highest spending category is ${facts.top.name} at ${money(facts.top.amount)}.` : 'There is not enough categorized spending yet.';
    if (q.includes('month')) return `You recorded ${money(facts.monthTotal)} in spending this month.`;
    if (q.includes('spend') || q.includes('expense')) return `You have ${spending.length} spending record${spending.length === 1 ? '' : 's'}, totaling ${money(facts.allSpent)}. This month: ${money(facts.monthTotal)}.`;
    if (q.includes('transaction') || q.includes('history') || q.includes('deposit') || q.includes('withdraw')) {
      const recent = [...walletTransactions].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 3);
      return recent.length ? `Your latest wallet entries are: ${recent.map(t => `${t.note} (${t.type === 'credit' ? '+' : '-'}${money(t.amount)})`).join(', ')}.` : 'Your wallet transaction history is empty.';
    }
    if (q.includes('summary') || q.includes('overview')) return `Balance: ${money(walletBalance)}. Total recorded spending: ${money(facts.allSpent)}. This month: ${money(facts.monthTotal)}. Outstanding owed: ${money(facts.outstanding)}.`;
    if (q.includes('save') || q.includes('advice') || q.includes('tip')) return facts.top?.amount ? `Your biggest recorded category is ${facts.top.name}. Review its individual expenses first and set a realistic limit below ${money(facts.top.amount)} for the next comparable period.` : 'Start recording expenses with categories, and I can identify where reducing spending may help.';
    return 'I can answer questions like “What is my balance?”, “How much did I spend this month?”, “What is my top category?”, “Who owes me?”, or “Show my recent transactions.”';
  }

  function send(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages(current => [...current, { from: 'user', text: question }, { from: 'bot', text: answer(question) }]);
    setInput('');
  }

  return (
    <div className="fixed right-4 bottom-20 md:bottom-5 z-[60]">
      {open && <div className="mb-3 w-[calc(100vw-2rem)] sm:w-96 h-[32rem] max-h-[70vh] rounded-2xl glass-card border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-primary/10">
          <div className="flex items-center gap-2"><Sparkles className="text-primary" size={18} /><div><p className="font-semibold">Wallet Assistant</p><p className="text-[11px] text-muted-foreground">Analyzes your private records</p></div></div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X size={18} /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => <div key={index} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.from === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-white/5 border border-white/10'}`}>{message.text}</div>)}
        </div>
        <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2"><Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your wallet…" className="bg-black/20" /><Button size="icon" type="submit"><Send size={17} /></Button></form>
      </div>}
      <Button onClick={() => setOpen(!open)} className="ml-auto size-14 rounded-full luxury-glow shadow-xl" aria-label="Open wallet assistant"><Bot size={24} /></Button>
    </div>
  );
}
