import { Card, CardContent } from './ui/card';
import { Globe, Phone, Users, Target, Lightbulb } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="relative h-64 rounded-xl overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1761195696590-3490ea770aa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBwbHklMjBjaGFpbiUyMGxvZ2lzdGljcyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYzMjg4MTMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Supply Chain Technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex justify-center mb-4">
              <img src="/circle.png" alt="Swiss SupplyChainTech Logo" className="w-20 h-20 bg-white rounded-xl p-2" />
            </div>
            <h1 className="mb-2">Swiss SupplyChainTech</h1>
            <p className="text-xl opacity-90">Advancing Technologies for Supply Chains</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <img src="/swisssupplychaintech.png" alt="Swiss SupplyChainTech" className="h-16" />
          </div>
          
          <h2 className="mb-4">Overview</h2>
          <p className="text-muted-foreground mb-6">
            Swiss SupplyChainTech is a non-profit company network and expert community in the 
            fields of supply chain management, i.e. especially purchasing, logistics, transport 
            and distribution. It was founded at the Bern University of Applied Sciences (BFH, 
            Department of Industrial Engineering and Management Science) in 2021 and seeks to 
            grow continuously – together with its members and stakeholders.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex gap-4">
              <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  Together, we want to advance technologies and solutions for supply chains. 
                  The network should increase members' visibility and leverage synergies 
                  amongst members for further developments – with value and purpose.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="mb-2">Stakeholder Value</h3>
                <p className="text-muted-foreground">
                  Stakeholders such as customers and investors gain access and an overview 
                  of the SupplyChainTech ecosystem, fostering collaboration and innovation.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a
                    href="https://supplychaintech.ch/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://supplychaintech.ch/
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href="tel:+41323216271" className="hover:text-blue-600">
                    +41 32 321 62 71
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Company Size</p>
                  <p>2-10 employees</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Industry</p>
                <p>Transportation, Logistics, Supply Chain and Storage</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Founded</p>
                <p>2021</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'SupplyChainTech',
                    'LogisticsTech',
                    'ProcureTech',
                    'Research',
                    'Consulting',
                    'Education',
                    'Network',
                    'Community',
                  ].map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1590142376894-d029223ee9cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2lzcyUyMHRlY2hub2xvZ3klMjBidWlsZGluZ3xlbnwxfHx8fDE3NjMzODUxMzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Swiss Technology Building"
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1611926653670-e18689373857?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmslMjBjb21tdW5pdHl8ZW58MXx8fHwxNzYzMzg1MTM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Business Network Community"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}