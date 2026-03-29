import { useState, useMemo } from 'react';
import { 
  BookOpen, Shield, Globe, Lock, AlertTriangle, ExternalLink, 
  Footprints, ChevronRight, Info, Lightbulb, CheckCircle2, 
  ArrowRight, Key, EyeOff, Laptop, X, ListChecks, LayoutGrid
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

import educationalContent from '../data/educationalContent.json';

export function PrivacyEducation() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const iconMap: Record<string, any> = {
    Footprints, Shield, BookOpen, Globe, Lock, AlertTriangle, Key, EyeOff, Laptop
  };

  const activeModuleData = useMemo(() => 
    educationalContent.modules.find(m => m.id === selectedModule), 
    [selectedModule]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-md">
            Academic Research Vault
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Privacy Education Centre
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Master the complexities of your digital footprint through research-backed modules 
            aligned with UK GDPR standards and the Masur (2020) Literacy Framework.
          </p>
        </div>
      </section>

      <Tabs defaultValue="modules" className="space-y-10">
        <div className="flex justify-center">
          <TabsList className="bg-slate-100 p-1 rounded-xl border border-slate-200">
            <TabsTrigger value="modules" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Learning Modules
            </TabsTrigger>
            <TabsTrigger value="cases" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Intelligence Briefings
            </TabsTrigger>
            <TabsTrigger value="resources" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
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
                  className="group relative flex flex-col border-none shadow-md ring-1 ring-slate-200 hover:ring-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedModule(module.id)}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <IconComponent size={80} />
                  </div>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedModule === module.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 leading-relaxed line-clamp-2">
                      {module.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto border-t border-slate-50 pt-4">
                    <div className="flex items-center text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
                      Begin Exploration <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Immersive Module Reader */}
          {activeModuleData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-none flex flex-col">
                <CardHeader className="bg-slate-50 border-b flex flex-row justify-between items-center sticky top-0 z-10 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                      {(() => {
                        const Icon = iconMap[activeModuleData.icon] || BookOpen;
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>
                    <CardTitle className="text-2xl font-black">{activeModuleData.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedModule(null)} className="rounded-full hover:bg-slate-200">
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                
                <CardContent className="overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                  {activeModuleData.content.map((section: any, index: number) => (
                    <div key={index} className="animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                      
                      {section.type === 'heading' && (
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                          <div className="h-1 w-4 bg-blue-600 rounded-full" /> {section.value}
                        </h3>
                      )}

                      {section.type === 'text' && (
                        <p className="text-slate-600 text-lg leading-relaxed mb-4">
                          {section.value}
                        </p>
                      )}

                      {/* NEW: Professional List View */}
                      {section.type === 'list' && (
                        <div className="space-y-4 my-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                          {section.items.map((item: any, i: number) => (
                            <div key={i} className="flex flex-col md:flex-row md:gap-3 items-start group">
                              <span className="font-bold text-slate-900 min-w-[160px] text-sm uppercase tracking-tight py-1 bg-white px-3 rounded border border-slate-200 shadow-sm md:border-none md:bg-transparent md:p-0 md:shadow-none mb-2 md:mb-0">
                                {item.label}
                              </span>
                              <span className="text-slate-600 leading-relaxed md:pt-0">{item.description}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* NEW: Professional Grid View (Ideal for GDPR Rights) */}
                      {section.type === 'grid-list' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                          {section.items.map((item: any, i: number) => (
                            <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                                <h4 className="font-black text-slate-900 text-sm tracking-tight">{item.label}</h4>
                              </div>
                              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.type === 'statistic' && (
                        <div className="flex items-start gap-4 bg-amber-50 border border-amber-100 p-6 rounded-2xl my-6">
                          <Info className="h-6 w-6 text-amber-600 shrink-0" />
                          <p className="text-amber-900 font-semibold italic text-lg">{section.value}</p>
                        </div>
                      )}

                      {section.type === 'action' && (
                        <div className="flex items-start gap-4 bg-emerald-50 border border-emerald-100 p-6 rounded-2xl my-6">
                          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 block mb-1">Recommended Strategy</span>
                            <p className="text-emerald-900 font-medium text-lg">{section.value}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="bg-slate-50 border-t p-4 flex justify-end shrink-0">
                  <Button onClick={() => setSelectedModule(null)} className="bg-slate-900 hover:bg-slate-800 px-8 py-6 rounded-xl font-bold">
                    Complete Learning Module
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 2. Intelligence Briefings */}
        <TabsContent value="cases" className="outline-none">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Real-World Forensic Analysis</h2>
              <p className="text-slate-500">Deconstructing high-profile privacy failures to prevent future exposure.</p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {educationalContent.caseStudies.map((caseStudy) => (
                <AccordionItem key={caseStudy.id} value={caseStudy.id} className="border border-slate-200 rounded-2xl px-6 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <AccordionTrigger className="hover:no-underline py-6">
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-bold text-slate-900">{caseStudy.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8">
                    <div className="grid gap-6 pt-2 border-t border-slate-50 mt-2">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-tighter">The Incident</h4>
                          <p className="text-slate-700 leading-relaxed">{caseStudy.description}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-tighter">Societal Impact</h4>
                          <p className="text-slate-700 leading-relaxed">{caseStudy.impact}</p>
                        </div>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden group">
                        <Lightbulb className="absolute top-4 right-4 h-12 w-12 text-blue-500/20 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" /> Key Forensic Takeaway
                        </h4>
                        <p className="text-slate-300 italic">"{caseStudy.lesson}"</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        {/* 3. Resources & Toolkit */}
        <TabsContent value="resources" className="space-y-10 outline-none">
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-2xl font-black text-slate-900">Regulatory & Advocacy Registry</h3>
              <div className="grid gap-4">
                {educationalContent.resources.map((resource, index) => (
                  <a 
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all"
                  >
                    <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl transition-colors">
                      <ExternalLink className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600">{resource.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-1">{resource.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </div>

            {/* Privacy Toolkit */}
            <Card className="bg-slate-900 border-none shadow-2xl text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <Lock className="h-5 w-5" /> Professional Toolkit
                </CardTitle>
                <CardDescription className="text-slate-400">Essential stack for hardened digital privacy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: "Vaults", items: ["Bitwarden", "1Password"], icon: Key },
                  { title: "Anonymizers", items: ["Mullvad VPN", "Proton"], icon: Shield },
                  { title: "Hardened Browsers", items: ["LibreWolf", "Brave"], icon: Laptop }
                ].map((tool, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-widest">
                      <tool.icon className="h-3 w-3" /> {tool.title}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tool.items.map(item => (
                        <Badge key={item} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 hover:text-white">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  Not sponsored. Recommendations based on independent security audits.
                </p>
              </CardFooter>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}