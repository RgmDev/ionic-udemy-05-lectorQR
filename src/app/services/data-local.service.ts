import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  private _storage: Storage | null = null;
  guardados: Registro[] = [];

  constructor(
    private storage: Storage,
    private navCtrl: NavController,
    private iab: InAppBrowser,
    private file: File,
    private emailComposer: EmailComposer
  ) {
    this.init(); 
    this.cargarStorage();
  }

  async cargarStorage() {
    this.guardados = await this.storage.get('registros') || [];
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async guardarRegistro(format: string, text: string) {
    await this.cargarStorage();
    const nuevoRegistro = new Registro(format, text);
    this.guardados.unshift(nuevoRegistro);
    this.storage.set('registros', this.guardados);
    this.abrirRegistro(nuevoRegistro);
  }

  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('tabs/tab2');
    switch(registro.type) {
      case 'http':
        this.iab.create(registro.text, '_system');
      break;
      case 'geo':
        this.navCtrl.navigateForward(`tabs/tab2/mapa/${registro.text}`);
      break;
    }
  }

  enviarCorreo() {
    const arrTmp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';
    arrTmp.push(titulos);
    this.guardados.forEach( registro => {
      const linea = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', ' ')}\n`;
      arrTmp.push(linea);
    });
    this.crearArchivoFisico(arrTmp.join(' '));
  }

  crearArchivoFisico(text: string) {
    this.file.checkFile(this.file.dataDirectory, 'registros.csv')
      .then(existe => {
        console.log('Existe archivo: ', existe);
        return this.escribirEnArchivo(text);
      })
      .catch( err => {
        return this.file.createFile(this.file.dataDirectory, 'registros.csv', false)
                .then( creado => this.escribirEnArchivo(text))
                .catch(errFile => console.log('No se pudo crear el archivo', errFile))
      });
  }

  async escribirEnArchivo(text: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv', text);

    const archivo = `${this.file.dataDirectory}/registros.csv`;

    let email = {
      to: 'rubengm410@gmail.com',
      attachments: [
        archivo,
      ],
      subject: 'Backup de scans',
      body: 'Aquí tiene su backup de scan',
      isHtml: true
    }

    this.emailComposer.open(email);

  }

}
