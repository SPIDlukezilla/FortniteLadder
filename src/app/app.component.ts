import { Component } from '@angular/core';
import { Response } from '@angular/http';

import { RouterModule } from '@angular/router';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Http, Headers } from '@angular/http';

// import fontawesome, { FontawesomeObject } from '@fortawesome/fontawesome';
// import faTrashAlt from '@fortawesome/fontawesome-free-regular/';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  FullTable: any;
  NewUser: string;
  NewUserTwitch: string;

  RatingType = 1;

  Platform = 'pc';
  SelectedPlatform = 'pc';

  ServerResponse: string;

  Search: string;

  CurretnlyFeatured: string;
  FeaturedList = ['lifetimeKD', 'lifetimeKills', 'lifetimeWins', 'currentSeasonKDSolo', 'currentSeasonKDDuo', 'currentSeasonKDSquad'];
  FeaturedListClean = ['Lifetime KD', 'Lifetime Wins', 'Lifetime Kills', 'Season KD Solo', 'Season KD Duo', 'Season KD Squad'];
  CurrentlyFeaturedTable: any;
  FeaturedItem: string;
  FeaturedItems: any;
  FeaturedPlatform: string;

  TwitchResponse: any;
  isOnline: boolean;
  liveCount: number;

  constructor(private http: HttpClient) {
    this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy=1&platform=pc').subscribe(data => {
      this.FullTable = data;
      this.checkIfLive(this.FullTable);
      console.log(data);
    });
    const i = Math.floor(Math.random() * this.FeaturedListClean.length);
    const id = i + 4;
    this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy=' + id + '&platform=pc').subscribe(data => {
      this.CurrentlyFeaturedTable = data;
      this.FeaturedItem = this.FeaturedList[i];
      this.CurretnlyFeatured = this.FeaturedListClean[i];
      console.log(this.CurrentlyFeaturedTable);
      this.checkIfLive(this.CurrentlyFeaturedTable);
    });
    // this.CurretnlyFeatured = this.FeaturedListClean[i];

  }

  onSubmit(form: HTMLFormElement) {
    this.NewUser = form.value.igralec;
    this.NewUserTwitch = form.value.twitch;

    const body = new FormData();
    body.append('Username', this.NewUser);
    if (this.NewUserTwitch) {
      body.append('twitchUsername', this.NewUserTwitch);
    }
    body.append('platform', this.Platform);

    const req = this.http.post('https://fortniteleaderboard.azurewebsites.net/Fortnite/AddUser', body)
      .subscribe(
        res => {
          console.log(res);
          this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy=1'
            + '&platform=' + this.SelectedPlatform).subscribe(data => {
              this.FullTable = data;
              this.checkIfLive(this.FullTable);
            });
          form.reset();
        },
        err => {
          console.log(err);
        }
      );
  }

  onTwitch(id: number) {
    const TwitchLink = this.FullTable[id].twitchUsername;
    window.open('https://www.twitch.tv' + TwitchLink, '_blank');
  }

  onChangeType(type: number) {
    this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy='
      + type + '&platform=' + this.SelectedPlatform).subscribe(data => {
        this.FullTable = data;
        this.RatingType = type;
        this.checkIfLive(this.FullTable);
      });
  }

  OnChangePlatform(plat: string) {
    this.Platform = plat;
  }

  onChangeTypePlatform(splat: string) {
    this.SelectedPlatform = splat;
    this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy=1&platform=' + splat).subscribe(data => {
      this.FullTable = data;
      this.checkIfLive(this.FullTable);
    });
  }

  onUpdateTables() {
    /*     this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/UpdateUsers?calledFromCron=true').subscribe(data => {
          console.log(data);
          this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy=1'
            + '&platform=' + this.SelectedPlatform).subscribe(table => {
              this.FullTable = table;
            });
        }); */

  }

  checkIfLive(tabela: any) {

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Client-ID', '66z5kiixkmb10wu5llchu5le0pna4k');

    tabela.forEach(element => {
      if (element.twitchUsername) {
        const name = element.twitchUsername.slice(1);
        this.http.get('https://api.twitch.tv/helix/streams?user_login=' + name, { headers: headers }).subscribe(res => {
          this.TwitchResponse = res;
          console.log(res);
          if (this.TwitchResponse.data.length > 0) {
            element['live'] = true;
            element['liveCount'] = this.TwitchResponse.data[0].viewer_count;
          } else {
            element['live'] = false;
          }
        });
      }
    });
  }

}
