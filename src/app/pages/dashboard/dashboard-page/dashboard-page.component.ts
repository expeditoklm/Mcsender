import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';


@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports:[
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {

  // Example statistics data
  totalUsers = 1523;
  activeSessions = 387;
  totalSales = 4823;
  newOrders = 73;
  profit = 12892;
}
