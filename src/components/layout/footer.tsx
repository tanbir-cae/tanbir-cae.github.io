import Link from "next/link";
import { Wordmark } from "@/components/branding/wordmark";
import { Container } from "@/components/layout/container";
import { ENGINEER } from "@/lib/constants";
import { Mail, ExternalLink, Lock, Box, Wind, Activity, Bot, BookOpen, Award, ArrowUpRight } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/icons";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Branding & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Wordmark />
            <p className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
              {ENGINEER.title}
            </p>
            <p className="text-xs leading-relaxed text-muted max-w-sm font-sans">
              Industrial &amp; Production Engineering graduate specializing in Mechanical Design, SolidWorks 3D CAD, FEA, CFD simulations, and physical robotics prototyping.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={ENGINEER.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <LinkedinIcon className="h-3.5 w-3.5" />
                LinkedIn
              </a>
              <a
                href={`mailto:${ENGINEER.email}`}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            </div>
          </div>

          {/* Col 3: Engineering Work */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Work &amp; Case Studies
            </h4>
            <ul className="space-y-2 text-xs font-mono text-muted">
              <li>
                <Link href="/work" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>Work Archive</span>
                </Link>
              </li>
              <li>
                <Link href="/work?category=cad" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Box className="h-3 w-3 text-blue-500" />
                  <span>3D CAD &amp; Assemblies</span>
                </Link>
              </li>
              <li>
                <Link href="/work?category=cfd" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Wind className="h-3 w-3 text-cyan-500" />
                  <span>CFD Simulation</span>
                </Link>
              </li>
              <li>
                <Link href="/work?category=fea" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Activity className="h-3 w-3 text-amber-500" />
                  <span>FEA Stress &amp; Strain</span>
                </Link>
              </li>
              <li>
                <Link href="/work?category=robotics" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Bot className="h-3 w-3 text-emerald-500" />
                  <span>Robotics &amp; Control</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Technical & Academic */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Academic &amp; Evidence
            </h4>
            <ul className="space-y-2 text-xs font-mono text-muted">
              <li>
                <Link href="/research" className="hover:text-primary transition-colors flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Research &amp; Publications</span>
                </Link>
              </li>
              <li>
                <Link href="/credentials" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>Certifications &amp; GD&amp;T</span>
                </Link>
              </li>
              <li>
                <Link href="/media" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>Simulation Animations</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  <span>Engineering Biography</span>
                </Link>
              </li>
              <li>
                <Link href="/cv" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>Curriculum Vitae</span>
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Inquiries */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Direct Contact
            </h4>
            <p className="text-xs text-muted leading-relaxed font-sans">
              Open to mechanical design consulting, CAE simulation analysis, and engineering roles.
            </p>
            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 font-mono text-xs font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Send Inquiry
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Engineering Creed and Discreet Admin Login */}
        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-muted">
          <div>
            © {currentYear} {ENGINEER.fullName}. All technical rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted/80">Design · Simulate · Analyze · Build</span>
            <span className="text-border">|</span>
            <Link
              href="/admin/login"
              className="flex items-center gap-1 text-muted/60 hover:text-foreground transition-colors"
              title="Admin CMS Portal"
            >
              <Lock className="h-3 w-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
