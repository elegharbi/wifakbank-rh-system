import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payslip-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payslip-viewer.html',
  styleUrl: './payslip-viewer.css'
})
export class PayslipViewer implements OnInit {
  private route = inject(ActivatedRoute);
  
  payslipId: string | null = null;
  payslip: any = null;

  ngOnInit() {
    this.payslipId = this.route.snapshot.paramMap.get('id');
    // Simulation du fetch d'une fiche de paie
    const base = 2500;
    const bonus = 300;
    const deductions = 450;
    
    this.payslip = {
      id: this.payslipId,
      company: {
        name: "Wifak Bank",
        address: "2, Boulevard de la Terre, Centre Urbain Nord",
        city: "1082 Tunis, Tunisie",
        matricule: "1234567/A/M/000"
      },
      employee: {
        name: "Ahmed Ben Salem",
        position: "Développeur Senior",
        matricule: "EMP-2023-045",
        department: "DSI"
      },
      period: "Avril 2026",
      paymentDate: "25/04/2026",
      details: [
        { label: "Salaire de Base", base: base, rate: "", amount: base },
        { label: "Prime d'Assiduité", base: bonus, rate: "", amount: bonus },
        { label: "Retenue CNSS (9.18%)", base: base, rate: "9.18%", amount: -(base * 0.0918) },
        { label: "Retenue IRPP", base: "", rate: "", amount: -220.50 }
      ],
      totals: {
        gross: base + bonus,
        deductions: (base * 0.0918) + 220.50,
        net: (base + bonus) - ((base * 0.0918) + 220.50)
      }
    };
  }

  printPayslip() {
    window.print();
  }
}

