import { Component } from '@angular/core';

import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { DataLocalService } from '../../services/data-local.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  slidesOpts = {
    allowSlidePrev: false,
    allowSlideNext: false
  };

  constructor(
    private barcodeScanner: BarcodeScanner,
    private dataLocal: DataLocalService
  ) {}

  ionViewWillEnter() {
    // this.scan();
  }

  scan() {
    // this.dataLocal.guardarRegistro('QRCode', 'geo:40.452526,-3.690614');
    // this.dataLocal.guardarRegistro('QRCode', 'https://www.linkedin.com/in/ruben-gonzalez-martin/');
    
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      if(!barcodeData.cancelled) {
        this.dataLocal.guardarRegistro(barcodeData.format, barcodeData.text);
      }
     }).catch(err => {
         console.log('Error', err);
     });
  }

}
