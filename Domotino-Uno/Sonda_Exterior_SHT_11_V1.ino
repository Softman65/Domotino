
#include "DHT.h"
#define DHTPIN A0     // what pin we're connected to
#define DHTTYPE DHT22   // DHT 11 
DHT dht(DHTPIN, DHTTYPE);



#include <OneWire.h>
OneWire  ds(2);        // on pin 2 (a 4.7K resistor is necessary)

#include <SPI.h>
#include <Ethernet.h>
#define SDCARD_CS 4
#define _maxCicle 59

int _nsonda = 6;
int lightPin = A5;
int testPin = 8;

byte mac[] = {
  0x90, 0xA2, 0xDA, 0x10, 0x1E, 0x00 + _nsonda
};
IPAddress ip(192, 168, 1, 230 + _nsonda);
IPAddress Yun(192, 168, 1, 230);
// initialize the library instance:
EthernetClient client;
EthernetServer server(80);

volatile byte LCounterT = 0;
volatile byte LCounterH = 0;
volatile byte LCounterL = 0;
String outwww = "";

float Lecturas[6] = {0,0, 0};
float _old[3] = {0,0,0};
float Last[6] = {0, 0 , 0, 0, 0, 0};

byte addr[8];
float sum_adr;

String tipo_sonda = "SHT11";
float celsius, fahrenheit;
boolean _tx;

boolean lastConnected = false;                 // state of the connection last time through the main loop
unsigned long lastConnectionTime = 0;          // last time you connected to the server, in milliseconds
boolean ConnectionFail = false;                 // state of the connection last time through the main loop
boolean InitSonda = true;                 // state of the connection last time through the main loop

char buf[35] = "                                  ";

    #define NroDimmers   6
    int values[] = {    // set values channel output level (0 = 100%, 50 = 0%)
      0, // Output 0
      0, // output 1
      0, // output 2
      0, // output 3
      0, // output 4
      0, // output 5
      0, // output 6
      0, // output 7
    };

    int output [] = { // assign a pin for each channel.
      3, // Output 0
      5, // output 1
      6, // output 2
      9, // output 3
      4, // output 4
      7, // output 5
      0, // output 6
      0, // output 7
    };


float _t;

  
void setup(void) {
  pinMode(testPin, OUTPUT);
  digitalWrite(testPin,LOW);
  
  Serial.begin(9600);
  
  //pinMode(SDCARD_CS,OUTPUT);
  //digitalWrite(SDCARD_CS,HIGH);//Deselect the SD card
  // give the ethernet module time to boot up:
  delay(5000);
  // start the Ethernet connection using a fixed IP address and DNS server:
  
  Ethernet.begin(mac,ip);
  // print the Ethernet board/shield's IP address:
  Serial.print("My IP address: ");
  Serial.println(Ethernet.localIP());
  server.begin();
  
  
    ds.reset_search();
    delay(250);
    if ( !ds.search(addr)) {
      dht.begin();
    }else{
      tipo_sonda = "DS18B20";   
    }

  
  
  int c1=0;
  // Initialize the channel outputs (triacs)
  for (c1 = 0; c1 <= NroDimmers; c1++) {// we traverse the 8 channels to configure
    pinMode(output[c1], OUTPUT); // we associate each channel has a pin, which sets the output digital
    //lightOFF(output[c1]); // and we switch off the output
  } 
  //  clock.begin();
  lastConnectionTime = getTime();
}

void loop(){
  if (client.available()) {
    char c = client.read();
    Serial.print(c);
  }else{
    Serial.print(".");
    delay(900);
    digitalWrite(testPin,LOW);
    delay(100);
    digitalWrite(testPin,HIGH);
    GetData();
  }

  if (!client.connected() && lastConnected) {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
  }
//Read fail

  www();
  lastConnected = client.connected();
}



void GetData(void) {
  float h = 0;
  float t = 0;
  float l = 0;
  
  //Serial.print(tipo_sonda);
  
  if(tipo_sonda == "SHT11"){
      t = dht.readTemperature();
      h = dht.readHumidity();
  }else{
      t = read_T18B20();
  }
 //Serial.println(dht.readTemperature());
 
  l = analogRead(lightPin);
  Serial.println("lux");
  Serial.println(l);
  //Serial.println();
  
  if ( l< 1020  ) {
    Lecturas[3] =  Lecturas[3] + l ;
    LCounterL = LCounterL + 1;
   }else{
      Lecturas[3] = 0;
      LCounterL = 0;
  }
   //Serial.println(Lecturas[3]);
  //Serial.println(); 
  if( isnan(t) || isnan(h) ){
     Serial.print("error de lectura");
  }else{
    if ( h>0 ) {
      Lecturas[2] =  Lecturas[2] + h;
      LCounterH = LCounterH + 1;
    }else{
      Lecturas[2] = 0;
      LCounterH = 0;
    }
  } 
  if( !isnan(t)){
    Lecturas[0] = Lecturas[0] + t;
    LCounterT = LCounterT + 1;
    SetData();
  }
  
  return;
 
  
}
void SetData(){
    boolean _send = false;
    float _tiempo = millis() - lastConnectionTime ; 
    Last[0] = Lecturas[0]/LCounterT;
    
    if(Lecturas[2]>0){
         Last[2] = Lecturas[2]/LCounterH; 
    }
    
    if(Lecturas[3]> 0){
         Last[4] = map(Lecturas[3]/LCounterL,200,1010,0,100);
    }
    
    if( _tiempo > 60000) {  
         //if(_old[0] != Last[0] || ConnectionFail ){
            _send = true;           
         //}
         Last[1] = Last[0] - _old[0];
         Last[3] = Last[2] - _old[1];
         Last[5] = Last[4] - _old[2];

         if(Last[1]<=0.5 || Last[1]>=0.5){
            _old[0] = Last[0];
         }
         if(Last[3]<=0.5 || Last[3]>=0.5){
            _old[1] = Last[3];
         }  
         _old[2] = Last[5];
         
         if(_send){
            httpRequest( UrlEncodedata() ); 
         }else{
            Serial.println( UrlEncodedata() );
         }

         LCounterT = 0;
         LCounterH = 0;
         LCounterL = 0;         
        
         Lecturas[0]=0;
         Lecturas[2]=0;
         Lecturas[3]=0;       
         lastConnectionTime = getTime();

    
   }
}
String UrlEncodedata (){
   String _exit = "&_s=" + String(_nsonda);
   if(Last[4]>0){
      _exit = _exit + "&Lux=" + Last[4] + "&_vl=" + Last[5]; 
   }
  _exit = _exit + "&H=" + Last[2] + "&T=" + Last[0] + + "&_vt=" + Last[1] + "&_vh=" + Last[3];
  _exit = _exit  + "&type=" + tipo_sonda + "&_le=" + LCounterT;
   
   if(InitSonda){
        _exit = _exit + "&_Go=1";
        InitSonda= false;
   }else{
        _exit = _exit + "&_Go=0";       
   }
   return _exit;
}
unsigned long getTime(){
   return millis();
}


void www() {

  
  EthernetClient _client = server.available();
  if (_client) {
    Serial.println("new client");
    // an http request ends with a blank line
    boolean currentLineIsBlank = true;
    char blank[4] = " \n\r";
    int i=0;
    for(i=0;i<35;i++){
        buf[i] = blank[0];
    }
    i=0;    
    while (_client.connected()) {
      if (_client.available()) {
        char c = _client.read();
        if(c!= blank[1] && c!=blank[2] && i<=28){
               buf[i] = c;
               i++;
        }else{
            //Serial.write(c);
            // if you've gotten to the end of the line (received a newline
            // character) and the line is blank, the http request has ended,
            // so you can send a reply
            if (c == '\n' && currentLineIsBlank) {
              // send a standard http response header
              //outwww = decodeUrl();
              //Serial.print("@"+outwww+"@");              
              //Serial.print("Write JSON");
              
              _client.println("HTTP/1.1 200 OK");
              _client.println("Content-Type: text/html");
              //_client.println("Connnection: close");
              _client.println( decodeUrl() );
             // Serial.print(out);              
             // Serial.print("Write JSON");
              _client.println("<!DOCTYPE HTML>");
              _client.println("<html>");
              _client.println(decodeUrl());
                        // add a meta refresh tag, so the browser pulls again every 5 seconds:
              _client.println("</html>");
              break;
            }
            if (c == '\n') {
              // you're starting a new line
              currentLineIsBlank = true;
            } 
            else if (c != '\r') {
              // you've gotten a character on the current line
              currentLineIsBlank = false;
            }
        }
      }
    }
    // give the web browser time to receive the data
    delay(1);
    // close the connection:
    _client.stop();
    Serial.println("client disconnected");
  }
}

String decodeUrl(){
  //String out="                                                                                                         ";
  // read a frame type: "D / aaa / bbb / F
  // Or "D" starting character frame
  // Or "yyyy" No output which is set to modify
  // Or "bbbb" new set of output (between 0 and 100%)
  
  int n1 = 0;
  int n2 = 0;
  char c1, c2;
  int n;
  
  char p1[10];
  int S[6];

  String cadena;
  for(n==0;n<15;n++){
    cadena += buf[n];
  }
   //Serial.print(buf);
   sscanf(buf, "%s /%c/%d/%d/%d/%d/%d/%d/%c", &p1,&c1,&S[0],&S[1],&S[2],&S[3],&S[4],&S[5],&c2); // decoding frame
  if (c1 == 'G'){
    return "{ ""OK"":""1"" ,""H"":""" + String(Last[2])+ """,""T"":""" + String(Last[0]) + """}"; 
  }

  if (c1 == 'D' && c2 == 'F') {    // Check if the plot starts out by D and ending in F
    int nouv_cons = 0;
    for(n=0;n<6;n++){
      if(n<4){
        nouv_cons = constrain(S[n], 0, 100);       // we store the new value for the work then
        //nouv_cons = constrain(n2, 0, 255);
        nouv_cons = map(nouv_cons ,0 , 100, 0, 255); // on the new terminal value between 0 and 100%
        values[n] =  nouv_cons; //(50 - (nouv_cons / 2)); // it converts the value 0-100% in no phase delay
        analogWrite(output[n], values[n] );
      }else{
        nouv_cons = constrain(S[n], 0, 1);       // we store the new value for the work then
        
      // // Serial.print("#");
      //  Serial.print(nouv_cons);
      //  Serial.print("#");
        
        if(nouv_cons == 0){
            values[n] = LOW;
        }else{
            values[n] = HIGH;
        }
        digitalWrite(output[n],values[n]);
      }
    }
    return "{ ""ok"":""1""}";
  }
  
  return "";
}


// this method makes a HTTP connection to the server:
void httpRequest(String data) {
   digitalWrite(testPin,LOW);
   delay(1000);

   
  String url = "/data.aspx?command=Save&action="+tipo_sonda + data;
  Serial.println(url);
  if (client.connect(Yun, 1337)) {
    Serial.println("connecting=" + url);
    // send the HTTP PUT request:
    client.println("GET  " + url + " HTTP/1.1");
    client.println("Host: mipaloma.ewebmail.es");
    client.println("User-Agent: arduino-ethernet");
    client.println("Connection: close");
    client.println();
    ConnectionFail = false;
    // note the time that the connection was made:
    //lastConnectionTime = millis();
    digitalWrite(testPin,HIGH);
  }else{
    // if you couldn't make a connection:
    Serial.println("connection failed");
    Serial.println("disconnecting.");
    ConnectionFail = true;
    client.stop();
   digitalWrite(testPin,HIGH);
   delay(50);
   digitalWrite(testPin,LOW);
   delay(20);
   digitalWrite(testPin,HIGH);
   delay(50);
   digitalWrite(testPin,LOW);
   delay(20);
   digitalWrite(testPin,HIGH);
   delay(50);
   digitalWrite(testPin,LOW);
   delay(20);
   digitalWrite(testPin,HIGH);
   delay(50);
   digitalWrite(testPin,LOW);
   delay(50);
   digitalWrite(testPin,HIGH);
   delay(50);
   digitalWrite(testPin,LOW);
   delay(50);
   digitalWrite(testPin,HIGH);
   delay(50);
   digitalWrite(testPin,LOW);
   delay(50);
   digitalWrite(testPin,HIGH);
  }
  
}

float read_T18B20(){
  byte i;
  byte present = 0;
  byte type_s;
  byte data[12];

  if (OneWire::crc8(addr, 7) != addr[7]) {
      return - 999;
  }

  // the first ROM byte indicates which chip
  switch (addr[0]) {
    case 0x10:
      type_s = 1;
      break;
    case 0x28:
      type_s = 0;
      break;
    case 0x22:
      type_s = 0;
      break;
    default:
      return -998;
  } 

  ds.reset();
  ds.select(addr);
  ds.write(0x44,1);        // start conversion, use ds.write(0x44,1) with parasite power on at the end

  delay(750);     // maybe 750ms is enough, maybe not
  // we might do a ds.depower() here, but the reset will take care of it.

  present = ds.reset();
  ds.select(addr);    
  ds.write(0xBE);         // Read Scratchpad

  for ( i = 0; i < 9; i++) {           // we need 9 bytes
    data[i] = ds.read();
  }


  // Convert the data to actual temperature
  // because the result is a 16 bit signed integer, it should
  // be stored to an "int16_t" type, which is always 16 bits
  // even when compiled on a 32 bit processor.
  int16_t raw = (data[1] << 8) | data[0];
  if (type_s) {
    raw = raw << 3; // 9 bit resolution default
    if (data[7] == 0x10) {
      // "count remain" gives full 12 bit resolution
      raw = (raw & 0xFFF0) + 12 - data[6];
    }
  } else {
    byte cfg = (data[4] & 0x60);
    // at lower res, the low bits are undefined, so let's zero them
    if (cfg == 0x00) raw = raw & ~7;  // 9 bit resolution, 93.75 ms
    else if (cfg == 0x20) raw = raw & ~3; // 10 bit res, 187.5 ms
    else if (cfg == 0x40) raw = raw & ~1; // 11 bit res, 375 ms
    //// default is 12 bit resolution, 750 ms conversion time
  }
  celsius = (float)raw / 16.0;
  return celsius;
}
