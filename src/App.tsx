'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Users, MessageSquare, Briefcase, Calendar, CheckCircle2, ChevronRight, ArrowLeft, Send, X, HeartHandshake, Search, Star, AlertCircle, Loader2, Download, Bell, Key } from 'lucide-react';
import { Task, MatchResult, Volunteer } from '../types';
import { MOCK_VOLUNTEERS } from '../lib/mock-data';

export default function App() {
  const [view, setView] = useState<'api-key' | 'role' | 'curator' | 'volunteer-login' | 'volunteer'>('api-key');
  const [apiKey, setApiKey] = useState('');
  const [globalTask, setGlobalTask] = useState<Task | null>(null);
  const [activeVolunteer, setActiveVolunteer] = useState<Volunteer | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setView('role');
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setView('role');
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-blue-200">
      <AnimatePresence mode="wait">
        {view === 'api-key' && (
          <motion.div 
            key="api-key"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <ApiKeySetup onSave={handleSaveApiKey} />
          </motion.div>
        )}

        {view === 'role' && (
          <motion.div 
            key="role"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 relative"
          >
            <button 
              onClick={() => {
                localStorage.removeItem('gemini_api_key');
                setApiKey('');
                setView('api-key');
              }}
              className="absolute top-6 right-6 text-sm font-medium text-zinc-400 hover:text-zinc-600 flex items-center transition-colors bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm"
              title="Сменить API ключ"
            >
              <Key className="w-4 h-4 mr-2" /> Сменить ключ
            </button>
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HeartHandshake className="w-10 h-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 mb-4">Proji</h1>
              <p className="text-lg text-zinc-500 max-w-md mx-auto">Платформа для мэтчинга социальных задач и волонтеров.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <button 
                onClick={() => setView('curator')}
                className="group relative bg-white p-8 rounded-3xl border border-zinc-200 hover:border-blue-500 hover:shadow-md transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12">
                  <Briefcase className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-medium mb-2">Я — Куратор</h2>
                <p className="text-zinc-500 mb-8">Создание структурированных задач и автоматический подбор волонтеров.</p>
                <div className="flex items-center text-blue-600 font-medium">
                  Войти как куратор <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button 
                onClick={() => setView('volunteer-login')}
                className="group relative bg-white p-8 rounded-3xl border border-zinc-200 hover:border-emerald-500 hover:shadow-md transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12">
                  <Users className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-medium mb-2">Я — Волонтер</h2>
                <p className="text-zinc-500 mb-8">Просмотр задач и коммуникация с координатором проекта.</p>
                <div className="flex items-center text-emerald-600 font-medium">
                  Войти как волонтер <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {view === 'curator' && (
          <motion.div key="curator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CuratorView 
              task={globalTask} 
              setTask={setGlobalTask} 
              matches={matches} 
              setMatches={setMatches} 
              goBack={() => setView('role')} 
              apiKey={apiKey}
            />
          </motion.div>
        )}

        {view === 'volunteer-login' && (
          <motion.div key="volunteer-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VolunteerLogin 
              onSelect={(v: Volunteer) => { setActiveVolunteer(v); setView('volunteer'); }} 
              goBack={() => setView('role')} 
            />
          </motion.div>
        )}

        {view === 'volunteer' && (
          <motion.div key="volunteer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VolunteerView 
              task={globalTask} 
              volunteer={activeVolunteer} 
              goBack={() => setView('volunteer-login')} 
              apiKey={apiKey}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApiKeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [key, setKey] = useState('');

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 text-center">
      <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Key className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-medium text-zinc-900 mb-2">API Ключ Gemini</h2>
      <p className="text-zinc-500 mb-8 text-sm">
        Для работы приложения требуется ваш собственный API ключ Google Gemini. Он будет сохранен только в вашем браузере.
      </p>
      <input
        type="password"
        value={key}
        onChange={e => setKey(e.target.value)}
        placeholder="AIzaSy..."
        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-800 mb-4 text-center font-mono"
      />
      <button
        onClick={() => onSave(key)}
        disabled={!key.trim()}
        className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50"
      >
        Продолжить
      </button>
    </div>
  );
}
function CuratorView({ task, setTask, matches, setMatches, goBack, apiKey }: any) {
  const [rawText, setRawText] = useState('Нужны крепкие парни на субботу таскать коробки в приюте. Также нужен кто-то, кто умеет водить газель.');
  const [loadingTask, setLoadingTask] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

  const handleGenerateTask = async () => {
    if (!rawText.trim()) return;
    setLoadingTask(true);
    setMatches([]); 
    try {
      const res = await fetch('/api/parse-task', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey
        },
        body: JSON.stringify({ rawText })
      });
      const data = await res.json();
      if (res.ok) setTask(data);
      else alert(data.error);
    } catch (e) {
      alert('Ошибка сети');
    }
    setLoadingTask(false);
  };

  const handleMatch = async () => {
    if (!task) return;
    setLoadingMatches(true);
    try {
      const res = await fetch('/api/match-volunteers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey
        },
        body: JSON.stringify({ task })
      });
      const data = await res.json();
      if (res.ok) setMatches(data);
      else alert(data.error);
    } catch (e) {
      alert('Ошибка сети');
    }
    setLoadingMatches(false);
  };

  const handleAssign = (volunteerId: string) => {
    if (!task) return;
    setTask({ ...task, assignedVolunteerId: volunteerId });
    setSelectedMatch(null);
  };

  const handleDownloadJson = () => {
    if (!task) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(task, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "task.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 py-12">
      <button onClick={goBack} className="flex items-center text-zinc-500 hover:text-zinc-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" /> Назад к выбору роли
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                 <Briefcase className="w-5 h-5" />
               </div>
               <h2 className="text-2xl font-medium text-zinc-900">Создание задачи</h2>
             </div>
             <p className="text-zinc-500 mb-6 ml-13">Введите описание задачи в свободной форме.</p>
             
             <textarea 
               className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-zinc-800"
               rows={5}
               value={rawText}
               onChange={e => setRawText(e.target.value)}
               placeholder="Например: Ищем фотографа на благотворительный концерт в эту пятницу..."
             />
             
             <button 
               onClick={handleGenerateTask}
               disabled={loadingTask || !rawText.trim()}
               className="mt-4 w-full bg-zinc-900 text-white py-4 rounded-2xl font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center shadow-sm"
             >
               {loadingTask ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Сгенерировать структуру'}
             </button>
          </div>
          <AnimatePresence>
            {task && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                className="bg-zinc-900 text-white rounded-2xl p-8 shadow-md relative overflow-hidden"
              >
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-blue-300 border border-white/10 backdrop-blur-md">
                    {task.category || 'Общая категория'}
                  </div>
                  <button 
                    onClick={handleDownloadJson}
                    className="flex items-center text-xs font-medium text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
                    title="Скачать JSON"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Скачать JSON
                  </button>
                </div>
                <h3 className="text-2xl font-medium mb-3 leading-tight">{task.title}</h3>
                <p className="text-zinc-400 mb-6 text-sm leading-relaxed">{task.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Требуемые навыки</div>
                    <div className="flex flex-wrap gap-2">
                      {task.required_skills?.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-white/10 text-zinc-200 text-xs rounded-lg border border-white/5">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 flex items-center"><Calendar className="w-3 h-3 mr-1"/> График</div>
                    <div className="flex flex-wrap gap-2">
                      {task.required_schedule?.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-blue-500/20 text-blue-200 text-xs rounded-lg border border-blue-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="space-y-6">
          {task ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium text-zinc-900">Подбор волонтеров</h2>
                <button 
                  onClick={handleMatch}
                  disabled={loadingMatches}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loadingMatches ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  {matches.length > 0 ? 'Обновить' : 'Найти'}
                </button>
              </div>

              {matches.length === 0 && !loadingMatches && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-200 rounded-2xl">
                  <Users className="w-12 h-12 text-zinc-300 mb-4" />
                  <p className="text-zinc-500">Нажмите "Найти", чтобы система подобрала лучших кандидатов из базы.</p>
                </div>
              )}

              {matches.length > 0 && (
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  {matches.sort((a,b) => b.match_score - a.match_score).map((m, i) => {
                    const vol = MOCK_VOLUNTEERS.find(v => v.id === m.volunteerId);
                    if (!vol) return null;
                    const isTopMatch = m.match_score >= 80;
                    
                    return (
                      <motion.button 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        onClick={() => setSelectedMatch(m)}
                        className="w-full text-left p-5 border border-zinc-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group bg-white relative overflow-hidden"
                      >
                        {isTopMatch && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${isTopMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'}`}>
                              {vol.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-zinc-900 block">{vol.name}</span>
                              <div className="flex items-center text-xs text-zinc-500 mt-0.5">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                                {vol.rating.toFixed(1)} • {vol.skills.slice(0,2).join(', ')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {task?.assignedVolunteerId === vol.id ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Назначен
                              </span>
                            ) : (
                              <span className={`font-semibold text-lg ${isTopMatch ? 'text-emerald-600' : m.match_score > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                {m.match_score}%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-4 mb-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${m.match_score}%` }} 
                            transition={{ duration: 1, delay: 0.2 + (i*0.1), ease: "easeOut" }}
                            className={`h-full rounded-full ${isTopMatch ? 'bg-emerald-500' : m.match_score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          />
                        </div>
                        
                        <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">{m.reason}</p>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-200 border-dashed h-full flex flex-col items-center justify-center text-center opacity-50">
              <Search className="w-12 h-12 text-zinc-400 mb-4" />
              <h3 className="text-xl font-medium text-zinc-700 mb-2">Ожидание задачи</h3>
              <p className="text-zinc-500 max-w-xs">Сгенерируйте задачу слева, чтобы начать поиск волонтеров.</p>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              {(() => {
                const vol = MOCK_VOLUNTEERS.find(v => v.id === selectedMatch.volunteerId);
                if (!vol) return null;
                const isTopMatch = selectedMatch.match_score >= 80;

                return (
                  <>
                    <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-medium text-xl ${isTopMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {vol.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-medium text-zinc-900 flex items-center gap-2">
                            {vol.name}
                            <span className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                              <Star className="w-4 h-4 fill-amber-500 mr-1" /> {vol.rating.toFixed(1)}
                            </span>
                          </h3>
                          <p className="text-zinc-500 text-sm">Профиль волонтера</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedMatch(null)} className="p-2 bg-white rounded-full hover:bg-zinc-100 transition-colors border border-zinc-200 shadow-sm">
                        <X className="w-5 h-5 text-zinc-500" />
                      </button>
                    </div>
                    
                    <div className="p-8 space-y-8">
                      <div className={`p-6 rounded-2xl border ${isTopMatch ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className={`w-5 h-5 ${isTopMatch ? 'text-emerald-600' : 'text-blue-600'}`} />
                          <h4 className={`font-medium ${isTopMatch ? 'text-emerald-900' : 'text-blue-900'}`}>Результат скоринга ({selectedMatch.match_score}%)</h4>
                        </div>
                        <p className={`text-sm leading-relaxed ${isTopMatch ? 'text-emerald-800' : 'text-blue-800'}`}>
                          {selectedMatch.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2"/> Навыки</h4>
                          <div className="flex flex-wrap gap-2">
                            {vol.skills.map((s, i) => {
                              const isMatch = task?.required_skills.some(ts => ts.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ts.toLowerCase()));
                              return (
                                <span key={i} className={`px-3 py-1.5 text-xs rounded-lg border ${isMatch ? 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
                                  {s}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center"><Calendar className="w-4 h-4 mr-2"/> График</h4>
                            <div className="flex flex-wrap gap-2">
                              {vol.schedule.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-zinc-50 text-zinc-700 text-xs rounded-lg border border-zinc-200">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center"><Star className="w-4 h-4 mr-2"/> Интересы</h4>
                            <div className="flex flex-wrap gap-2">
                              {vol.interests.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-zinc-50 text-zinc-700 text-xs rounded-lg border border-zinc-200">{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
                      <button 
                        onClick={() => handleAssign(vol.id)}
                        disabled={task?.assignedVolunteerId === vol.id}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-zinc-400 flex items-center"
                      >
                        {task?.assignedVolunteerId === vol.id ? (
                          <><CheckCircle2 className="w-5 h-5 mr-2" /> Назначен на задачу</>
                        ) : (
                          'Назначить на задачу'
                        )}
                      </button>
                      <button onClick={() => setSelectedMatch(null)} className="px-6 py-2.5 bg-zinc-200 text-zinc-800 rounded-xl font-medium hover:bg-zinc-300 transition-colors">
                        Закрыть
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
function VolunteerLogin({ onSelect, goBack }: any) {
  return (
    <div className="max-w-4xl mx-auto p-6 py-12">
      <button onClick={goBack} className="flex items-center text-zinc-500 hover:text-zinc-900 mb-12 transition-colors font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" /> Назад
      </button>
      
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 mb-4">Выберите профиль</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">Для демонстрации выберите одного из тестовых волонтеров, чтобы увидеть персонализированный интерфейс.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_VOLUNTEERS.map((v, i) => (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={v.id} 
            onClick={() => onSelect(v)} 
            className="bg-white p-6 rounded-3xl border border-zinc-200 hover:border-emerald-500 hover:shadow-md transition-all text-left group flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-6">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-medium text-xl">
                 {v.name.charAt(0)}
               </div>
               <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                 <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
               </div>
            </div>
            <h3 className="font-medium text-xl text-zinc-900 mb-2 flex items-center justify-between">
              {v.name}
              <span className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 fill-amber-500 mr-1" /> {v.rating.toFixed(1)}
              </span>
            </h3>
            <div className="mt-auto pt-4 border-t border-zinc-100 space-y-2">
              <p className="text-xs text-zinc-500 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1.5"/> {v.skills.slice(0,2).join(', ')}</p>
              <p className="text-xs text-zinc-500 flex items-center"><Calendar className="w-3 h-3 mr-1.5"/> {v.schedule[0]}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
function VolunteerView({ task, volunteer, goBack, apiKey }: any) {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loadingChat]);


  useEffect(() => {
    if (task && volunteer && chatHistory.length === 0) {
      setChatHistory([{
        role: 'bot', 
        text: `Здравствуйте, ${volunteer.name}. Я координатор проекта. У вас указаны навыки: ${volunteer.skills.join(', ')}. Уточните, какие детали задачи вас интересуют?`
      }]);
    }
  }, [task, volunteer]);
  useEffect(() => {
    if (task && volunteer) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [task, volunteer]);

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto p-6 py-12 text-center">
         <button onClick={goBack} className="flex items-center text-zinc-500 hover:text-zinc-900 mb-12 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" /> Сменить профиль
         </button>
         <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="w-12 h-12 text-zinc-400" />
         </div>
         <h2 className="text-3xl font-medium text-zinc-900 mb-4">Нет активных задач</h2>
         <p className="text-zinc-500 text-lg">Куратор еще не опубликовал ни одной задачи. Возвращайтесь позже!</p>
      </div>
    );
  }

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setLoadingChat(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-api-key': apiKey
        },
        body: JSON.stringify({ taskContext: task, message: userMsg, volunteer })
      });
      const data = await res.json();
      if (res.ok) {
        setChatHistory(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'bot', text: 'Ошибка: ' + data.error }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Ошибка сети' }]);
    }
    setLoadingChat(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 py-8 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <button onClick={goBack} className="flex items-center text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" /> Сменить профиль
        </button>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100">
              <Bell className="w-5 h-5" />
              {task && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-50"></span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-200">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-medium text-sm">
              {volunteer.name.charAt(0)}
            </div>
            <span className="font-medium text-sm text-zinc-800">{volunteer.name}</span>
            <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 ml-2">
              <Star className="w-3 h-3 fill-amber-500 mr-1" /> {volunteer.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      
      
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-md w-full"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Новая задача!</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {task.assignedVolunteerId === volunteer.id 
                  ? 'Вы были назначены на новую задачу.' 
                  : 'Появилась задача, которая может вам подойти.'}
              </p>
            </div>
            <button onClick={() => setShowNotification(false)} className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 pb-6">
        
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 overflow-y-auto flex flex-col">
          <div className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600 mb-6 self-start">
            {task.category || 'Новая задача'}
          </div>
          {task.assignedVolunteerId === volunteer.id && (
            <div className="mb-6 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 self-start">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Вы назначены на эту задачу
            </div>
          )}
          <h2 className="text-3xl font-medium text-zinc-900 mb-4 leading-tight">{task.title}</h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">{task.description}</p>
          
          <div className="space-y-6 mt-auto pt-8 border-t border-zinc-100">
            <div>
              <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2"/> Требуется</h4>
              <div className="flex flex-wrap gap-2">
                {task.required_skills?.map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-zinc-50 text-zinc-700 text-xs rounded-lg border border-zinc-200">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center"><Calendar className="w-4 h-4 mr-2"/> Когда</h4>
              <div className="flex flex-wrap gap-2">
                {task.required_schedule?.map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden relative">
          <div className="bg-white/80 backdrop-blur-md p-5 border-b border-zinc-100 flex items-center gap-3 absolute top-0 left-0 w-full z-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-900">Координатор</h3>
              <p className="text-xs text-emerald-600 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> В сети</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6 bg-zinc-50/50">
            {chatHistory.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0 mt-1">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[75%] p-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-zinc-900 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white text-zinc-800 rounded-2xl rounded-tl-sm border border-zinc-100'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {loadingChat && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0 mt-1">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white border border-zinc-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-zinc-100">
            <div className="flex gap-2 bg-zinc-50 p-2 rounded-2xl border border-zinc-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <input 
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder="Спросить о задаче..."
                className="flex-1 px-4 bg-transparent outline-none text-zinc-800 placeholder:text-zinc-400"
              />
              <button 
                onClick={handleChat}
                disabled={loadingChat || !chatMessage.trim()}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center shadow-sm"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
