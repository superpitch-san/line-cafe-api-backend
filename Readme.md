Backend Line Cafe Project

Requirement:
 - install node, docker, docker-compose on your machine before run this repository.
   - docker docs link: https://docs.docker.com/get-started/
   - docker-compose docs link: https://docs.docker.com/compose/install/
 - need ngrok for open tunnel port and public project for connect with LINE chatbot and LIFF page. 
   - download in this link https://ngrok.com/download

Installation Project:
 - pull project on your machine.
 - copy ENV variables, credentials from my text attach file to docker-compose.yml in environment section and save file.
 - open your LINE developer console page, create LINE messenging API, this project need Line channel access token and LINE channel secret.
   - LINE channel secret you can find it in Basic setting.
   - LINE channel access token you can find and issue it in Messenging API setting.
 - copy your LINE channel secret and LINE channel access token to docker-compose.yml in environment section by following:
   - LINE_CHANNEL_SECRET=xxxxxxxxxxxxxxx (xxxxxxxxxxxxxxx is your credential)
   - LINE_ACCESSTOKEN=xxxxxxxxxxxxxxx (xxxxxxxxxxxxxxx is your credential)
 - open terminal and cd path of project.
 - run command 'docker-compose up -d' and waiting about 3 - 5 mins for build and run project in first time. (you can check docker logs by command 'docker logs [IMAGE ID]' )
 - open https://localhost:3030 on your browser for checking server is running.
 - when downloaded ngrok and make sure can run for open port in normally, open terminal and run command 'ngrok http 3030' wait a sec terminal will be display ngrok information and copy Forwarding URL (ex: https://4470f05d.ngrok.io) make sure protocol is https because LINE allow only https protocol.
 - Setting Webhook URL by Go to Messenging API setting in LINE developer console,
   in Webhook URL setting add your ngrok URL from previous step and add /webhook path (ex: https://4470f05d.ngrok.io/webhook)
   and Enable Use webhook setting below Webhook URL setting.
 - Adding a LIFF application by Go to LIFF setting in LINE developer console and Add LIFF application,
   in Endpoint URL setting add your ngrok URL from previous step and add /liff path (ex: https://4470f05d.ngrok.io/liff)
   create LIFF and you will see LIFF URL for use in your chatbot channel.
 - Go to public/liff/index.html in Line 50 (liffId: 'xxxxxxxxx-xxxxxxxxxx') replace 'xxxxxxxxx-xxxxxxxxxx' by your liff-id after created your LIFF (ex: line://app/1629935044-n5xZZMWM your liff id is 1629935044-n5xZZMWM), then save file
 - testing chatbot by typing something in your chatbot channel, if system run normally, chatbot will be response
 - testing LIFF by typing LIFF URL in your chatbot channel or create Rich menu in LINE manager page and add LIFF in Rich menu URI action type.
 - start add product in CMS before, you will see products on your LIFF URL.

    if have any problem or question, Can contact me at supapitch.sangmanee@gmail.com