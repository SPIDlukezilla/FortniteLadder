import { Component, HostListener, AfterViewInit} from '@angular/core';
import { Response } from '@angular/http';

import { RouterModule } from '@angular/router';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Http, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/interval';
import { element } from 'protractor';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {


  WindowWidth: number = window.innerWidth;


  FullTable: any;
  NewUser: string;
  NewUserTwitch: string;

  RatingType = 1;

  Platform = 'pc';
  SelectedPlatform = 'pc';

  Search: string;

  FormValid = true;

  CurretnlyFeatured: string;
  FeaturedList = ['lifetimeKD', 'lifetimeKills', 'lifetimeWins', 'currentSeasonKDSolo', 'currentSeasonKDDuo', 'currentSeasonKDSquad'];
  FeaturedListClean = ['Lifetime KD', 'Lifetime Wins', 'Lifetime Kills', 'Season KD Solo', 'Season KD Duo', 'Season KD Squad'];
  CurrentlyFeaturedTable: any;
  FeaturedItem: string;
  FeaturedItems: any;
  FeaturedPlatform: string;
  FeaturedPlatformID: number;
  id: number;
  i: number;

  TwitchResponse: any;
  isOnline: boolean;
  liveCount: number;

  showAlertError = false;
  showAlertWarning = false;
  showAlertSuccess = false;
  showAlertNaP = false;

  ServerResponse: string;

  SubmitLoading = false;

  constructor(private http: HttpClient) {
    this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy=1&platform=pc').subscribe(data => {
      this.FullTable = data;
      console.log(data);
    });

    this.getFeaturedTable();

    Observable.interval(2000 * 60).subscribe(x => {
      this.getFeaturedTable();
      console.log('Changed currently featured table');
    });

    Observable.interval(1000 * 60).subscribe(x => {
      this.onUpdate();
      console.log('Called update on full table');
    });
  }

  ngAfterViewInit() {
    this.WindowWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  resize(event) {
    this.WindowWidth = window.innerWidth;
    console.log(this.WindowWidth);
  }


  onSubmit(form: HTMLFormElement) {

    this.SubmitLoading = true;

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
          if (res === 'Username is already on the list') {
            this.showAlertWarning = true;
          } else if (res === 'User added') {
            this.showAlertSuccess = true;
          } else if (res === `User doesn't exist`) {
            this.showAlertNaP = true;
          } else {
            this.showAlertError = true;
            this.ServerResponse = res.toString();
          }
          this.SubmitLoading = false;
          this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy=1'
            + '&platform=' + this.SelectedPlatform).subscribe(data => {
              this.FullTable = data;
            });
          form.reset();
        },
        err => {
          console.log(err);
          this.showAlertError = true;
          this.ServerResponse = err.message;
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
      });
  }

  OnChangePlatform(plat: string) {
    this.Platform = plat;
  }

  onChangeTypePlatform(splat: string) {
    this.SelectedPlatform = splat;

    this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy=1&platform=' + splat).subscribe(data => {
      this.FullTable = data;
    });
  }

  onDissmiss(i: number) {
    switch (i) {
      case 0:
        this.showAlertSuccess = false;
        break;
      case 1:
        this.showAlertWarning = false;
        break;
      case 2:
        this.showAlertError = false;
        break;
      case 3:
        this.showAlertNaP = false;
        break;
    }
  }

  onUpdate() {
    this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/FullTable?sortBy='
      + this.RatingType + '&platform=' + this.SelectedPlatform).subscribe(data => {
        this.FullTable = data;
      });
  }

  getCurrenltyFeatured() {
    switch (this.FeaturedPlatformID) {
      case 0:
        this.FeaturedPlatform = 'pc';
        break;
      case 1:
        this.FeaturedPlatform = 'psn';
        break;
      case 2:
        this.FeaturedPlatform = 'xbl';
        break;
      default:
        this.FeaturedPlatform = 'all';
        break;
    }
  }

  getFeaturedTable() {
    this.http.get('https://fortniteleaderboard.azurewebsites.net/Fortnite/Spotlight')
      .subscribe(data => {
        console.log(data);
        this.CurrentlyFeaturedTable = data['fortniteUsers'];
        this.FeaturedPlatformID = data['platform'];
        this.id = data['sortedBy'];
        this.CurretnlyFeatured = this.FeaturedListClean[this.id];
        this.FeaturedItem = this.FeaturedList[this.id];
        this.getCurrenltyFeatured();
      });
  }

  onSearchChange() {
    const find = this.FullTable.find(x => x.username === this.Search);
    if (find) {
      const scroll = document.getElementById(this.Search);
      // console.log(scroll);
      scroll.scrollIntoView(false/* {block: 'end', behavior: 'smooth', inline: 'end'} */);
    }
  }

  onTwitchChange() {
    if (this.NewUserTwitch === '' || this.NewUserTwitch[0] === '/') {
      this.FormValid = true;
    } else {
      this.FormValid = false;
    }
  }

}
