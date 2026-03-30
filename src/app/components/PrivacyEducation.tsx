import { useState, useMemo } from 'react';
import { 
  BookOpen, Shield, Globe, Lock, AlertTriangle, ExternalLink, 
  Footprints, ChevronRight, Info, Lightbulb, CheckCircle2, 
  ArrowRight, Key, EyeOff, Laptop, X, ShieldAlert, FileSearch, 
  Gavel, Fingerprint, BarChart3
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

// Ensure this path matches your project structure
import educationalContent from '../data/educationalContent.json';

export function PrivacyEducation() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const iconMap: Record<string, any> = {
    Footprints, Shield, BookOpen, Globe, Lock, AlertTriangle, 
    Key, EyeOff, Laptop, ShieldAlert, FileSearch, Gavel, Fingerprint
  };

  const activeModuleData = useMemo(() => 
    educationalContent.modules.find(m => m.id === selectedModule), 
    [selectedModule]
  );

  const renderContent = (section: any, index: number) => {
    switch (section.type) {
      case 'heading':
        return (
          <h3 key={index} className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4 mt-4">
            <span className="h-1.5 w-8 bg-blue-600 rounded-full" /> {section.value}
          </h3>
        );
      case 'text':
        return (
          <p key={index} className="text-slate-600 text-lg leading-[1.8] font-medium mb-6">
            {section.value}
          </p>
        );
      case 'list':
      case 'grid-list':
        return (
          <div key={index} className={`grid ${section.type === 'grid-list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6 my-10`}>
            {section.items.map((item: any, i: number) => (
              <div key={i} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:ring-1 hover:ring-blue-100 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all" />
                  <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase">{item.label}</h4>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        );
      case 'statistic':
        return (
          <div key={index} className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 my-8 text-white shadow-2xl border border-slate-800">
            <BarChart3 className="absolute right-6 bottom-6 h-24 w-24 text-blue-500/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 block mb-4">Statistical Insight</span>
            <p className="text-2xl font-bold leading-tight relative z-10 italic">"{section.value}"</p>
          </div>
        );
      case 'action':
        return (
          <div key={index} className="flex items-start gap-5 bg-emerald-50/80 border border-emerald-100 p-8 rounded-[2rem] my-8 shadow-inner shadow-emerald-100/50">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 block mb-2">Professional Strategy</span>
              <p className="text-emerald-950 font-bold text-xl leading-snug">{section.value}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-top-4 duration-1000 px-4">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-10 py-20 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[100px]" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-md px-4 py-1 text-[10px] font-black uppercase tracking-widest">
              Academic Research Vault
            </Badge>
            <div className="h-px w-12 bg-slate-700" />
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">v3.1 Build 2026</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Privacy Education <span className="text-blue-500">Centre</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed font-medium">
            Master the complexities of your digital footprint through research-backed modules 
            aligned with <span className="text-white font-bold">UK GDPR</span> standards and the <span className="text-emerald-400 font-bold italic underline decoration-emerald-400/30 underline-offset-4">Masur (2020)</span> Literacy Framework.
          </p>
        </div>
      </section>

      <Tabs defaultValue="modules" className="space-y-12">
        <div className="flex justify-center">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200/60 backdrop-blur-xl h-auto">
            <TabsTrigger value="modules" className="px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
              Learning Modules
            </TabsTrigger>
            <TabsTrigger value="cases" className="px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
              Intelligence Briefings
            </TabsTrigger>
            <TabsTrigger value="resources" className="px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-xl transition-all">
              Toolkit & Registry
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Learning Modules Grid */}
        <TabsContent value="modules" className="space-y-12 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {educationalContent.modules.map((module) => {
              const IconComponent = iconMap[module.icon] || BookOpen;
              return (
                <Card 
                  key={module.id} 
                  className="group relative flex flex-col border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-slate-200 hover:ring-blue-500 rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden bg-white hover:-translate-y-2"
                  onClick={() => setSelectedModule(module.id)}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                    <IconComponent size={120} />
                  </div>
                  <CardHeader className="p-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium leading-relaxed">
                      {module.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto p-8 pt-0">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                      Begin Exploration <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {activeModuleData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
              <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-none flex flex-col rounded-[2.5rem] bg-white">
                <CardHeader className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100 flex flex-row justify-between items-center sticky top-0 z-10 shrink-0 p-8">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                      {(() => {
                        const Icon = iconMap[activeModuleData.icon] || BookOpen;
                        return <Icon className="h-6 w-6" />;
                      })()}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tighter text-slate-900">{activeModuleData.title}</CardTitle>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Academic Framework Module</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSelectedModule(null)} 
                    className="rounded-full hover:bg-slate-200 h-12 w-12 transition-transform hover:rotate-90 duration-300"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </CardHeader>
                <CardContent className="overflow-y-auto p-10 space-y-2 scrollbar-hide">
                  {activeModuleData.content.map((section: any, index: number) => (
                    <div key={index} className="animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 50}ms` }}>
                      {renderContent(section, index)}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="bg-slate-50 border-t border-slate-100 p-8 flex justify-between items-center shrink-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Proceed to secure local storage upon completion.</p>
                  <Button onClick={() => setSelectedModule(null)} className="bg-slate-900 hover:bg-blue-700 px-10 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all">
                    Acknowledge & Exit
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Intelligence Briefings Section */}
        <TabsContent value="cases" className="outline-none">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Forensic Case Analysis</h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto italic">Deconstructing high-profile data breaches to develop human-centered defensive strategies.</p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-6">
              {educationalContent.caseStudies.map((caseStudy) => (
                <AccordionItem key={caseStudy.id} value={caseStudy.id} className="border-none">
                  <Card className="rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ring-1 ring-slate-200/60">
                    <AccordionTrigger className="hover:no-underline p-8">
                      <div className="flex items-center gap-5 text-left">
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl shadow-inner">
                          <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-xl font-black text-slate-900 tracking-tight">{caseStudy.title}</span>
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">Status: Classified Review</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-8 pt-0 border-t border-slate-50">
                      <div className="grid gap-10 pt-8">
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                              <FileSearch className="h-3 w-3" /> The Incident
                            </h4>
                            <p className="text-slate-700 leading-relaxed font-medium">{caseStudy.description}</p>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                              <Gavel className="h-3 w-3" /> Societal Impact
                            </h4>
                            <p className="text-slate-700 leading-relaxed font-medium">{caseStudy.impact}</p>
                          </div>
                        </div>
                        
                        {/* New Professional Redirect Button */}
                        <div className="flex justify-center -mb-2">
                           <a 
                             href={caseStudy.reportUrl || "#"} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="w-full md:w-auto"
                           >
                             <Button variant="outline" className="w-full md:w-auto border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] h-12 px-8 transition-all gap-2 group">
                               View Full Incident Report <ExternalLink className="h-3 w-3 group-hover:rotate-45 transition-transform" />
                             </Button>
                           </a>
                        </div>

                        <div className="bg-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                          <Fingerprint className="absolute top-4 right-4 h-20 w-20 text-blue-500/10 group-hover:scale-110 transition-transform duration-700" />
                          <h4 className="font-black text-blue-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                             Key Forensic Takeaway
                          </h4>
                          <p className="text-xl font-medium leading-relaxed italic text-slate-200">"{caseStudy.lesson}"</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        {/* Resources & Registry Section */}
        <TabsContent value="resources" className="space-y-12 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Regulatory Registry</h3>
              <div className="grid gap-4">
                {educationalContent.resources.map((resource, index) => (
                  <a 
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-6 p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-blue-500 hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="p-5 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-[1.25rem] transition-all duration-500 shadow-inner">
                      <ExternalLink className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">{resource.title}</h3>
                      <p className="text-slate-500 font-medium text-sm line-clamp-1">{resource.description}</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-slate-200 group-hover:text-blue-600 transition-all group-hover:translate-x-2" />
                  </a>
                ))}
              </div>
            </div>

            <Card className="bg-slate-950 border-none shadow-[0_40px_80px_rgba(0,0,0,0.3)] text-white rounded-[2.5rem] p-4">
              <CardHeader className="p-8">
                <CardTitle className="flex items-center gap-3 text-emerald-400 font-black tracking-tighter text-2xl">
                  <Lock className="h-6 w-6" /> Hardened Stack
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium">Essential privacy infrastructure for UK residency security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 p-8 pt-0">
                {[
                  { 
                    title: "Secrets Management", 
                    icon: Key,
                    items: [
                      { name: "Bitwarden", url: "https://bitwarden.com" }, 
                      { name: "KeePassXC", url: "https://keepassxc.org" }
                    ] 
                  },
                  { 
                    title: "Network Tunneling", 
                    icon: Shield,
                    items: [
                      { name: "Mullvad", url: "https://mullvad.net" }, 
                      { name: "ProtonVPN", url: "https://protonvpn.com" }
                    ] 
                  },
                  { 
                    title: "Sandboxed Browsing", 
                    icon: Laptop,
                    items: [
                      { name: "LibreWolf", url: "https://librewolf.net" }, 
                      { name: "Tor Browser", url: "https://torproject.org" }
                    ] 
                  }
                ].map((tool, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                      <tool.icon className="h-3.5 w-3.5 text-blue-500" /> {tool.title}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tool.items.map(item => (
                        <a 
                          key={item.name} 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <Badge variant="secondary" className="bg-slate-900 text-slate-300 border border-slate-800 px-4 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all cursor-pointer font-bold text-[10px] flex items-center gap-2">
                            {item.name} <ExternalLink className="h-2.5 w-2.5" />
                          </Badge>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}