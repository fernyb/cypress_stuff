#!/bin/bash

# build_id="Sun 05 Sep 2021 07:07:17 PM PDT"
build_id=$(date)

function node_modules_not_installed() {
  [ ! -d ./node_modules ]
}

function run_tests() {
  local resource_app_path=$(cd ../ && DEBUG=cypress:cli npx cypress version 2>&1 | grep package.json | sed -n 's/.*from: \(.*\)\/package.json/\1/p')
  local appyml=$(find . $resource_app_path | grep config\/app\.yml | head -n1)
  sed -i "s/\"https:\/\/api.cypress.io\/\"/\"http:\/\/localhost:1234\/\"/" $appyml
  sed -i "s/\"https:\/\/on.cypress.io\/\"/\"http:\/\/localhost:8080\/\"/" $appyml

  build_id=$(date)
  local cores=$(grep 'cpu cores' /proc/cpuinfo | uniq | grep -P -o "\d+")
  # cores=$(($cores / 2))

  for count in $(seq 1 $cores)
  do
    cd ../ && npx cypress run --config-file cypress.json --parallel --record --key "${build_id}" --ci-build-id "${build_id}" > /dev/null &
  done
}

function verify_service() {
  local resp=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  --data '{"operationName":"getProjects","variables":{"filters":[]},"query":"query getProjects($orderDirection: OrderingOptions, $filters: [Filters]) {\n  projects(orderDirection: $orderDirection, filters: $filters) {\n    projectId\n    __typename\n  }\n}\n"}' \
  http://localhost:4000 -o /dev/null --write-out '%{http_code}\n')

  [[ $resp == 200 ]]
}

function stlogo_ascii() {
  echo "                                          'cddl:.                                                            "
  echo "                                    .,lxddl:;;:lxX0o                                                         "
  echo "                                 .lOOl.     ,   dNd. .                                                       "
  echo "                               .dXl.       kl .KX' o0WWx.  ';;,.                                             "
  echo "                              ,Xl         kM''NM'    .XMWdO0'.;NWKxc.                                        "
  echo "                             lX.   'cdxxOXMMxNMMc.KMWKKkOM0.:.  koOMMd                                       "
  echo "                            dX.  lkc.    ,lkXWMMWd.,ooc:ckl'Nl:.K.OMMMO,..;cc;.                              "
  echo "                           cW' .0x       .;oxOkdOMO.     .XoKMMKWWMMO;;oNMMMMWMX;                            "
  echo "                          'Nd  OMc    .coloxooc:WMO        ';;. .KMMkxNNKNMM; .,,                            "
  echo "                         .NM: ,MMK.  cN' ,:lONXckW0;             ,Kll  o0lXMNx;.                             "
  echo "                          'KWkOMX0K; 'dkoc:; ...:OMM,             0.    'NMXdl:.                             "
  echo "                            lNMM,  o0.    dK . ,:XMoO             dx     cMWl                                "
  echo "                              ;kX,  :o    lN.''..'kx;O.           oW.    'MMMl                               "
  echo "                                ,Nk'       kXc.   .oxOWd         .KM0   .k00MW,                              "
  echo "                                 dMM..:     ;0W0occlXK'     .clloolo0O' ...kMMO                              "
  echo "                                 oMM' oOl,''';kMMMNxc,,..,xXd.     ,0MMMWWMMMM0                              "
  echo "                         .::  cc;XMM.  ;WMMMMMMMMNkdodKMMMW,    ;KWMMMMMMMMMXc                               "
  echo "                         KMN;  ,d0Kc   .XMMMMMMMMN0x   KMMMl..cKMMMMMMMMMMN:                                 "
  echo "                         .oXMXd;.      'lxKWMMMMMM0.   XMMMMMMMMMMMMMMMMM0.                                  "
  echo "                            .l0WMN0xl;.     'o0WMd    :MMMMMMMMMMMMMMMWO:                                    "
  echo "                                'lkKWMMWKko:.   .    .NMMMMMMMMMMMXOl'                                       "
  echo "                             cOo,    'ckWMMMMNkc.    ,kWMMMMMMWo;.                                           "
  echo "                              'kWWKd;    ;kWMMMMM0c.    :0MMMMk                                              "
  echo "                              .'.c0MMWOc.   cXMMMMMWk'    .dNW.                                              "
  echo "                              .KNo .kWMMWx    lNMMMMMMO.     .                                               "
  echo "                                ..    ';;'     .cxO000Oo                                                     "
  echo "                                                                                                             "
  echo "    ;dkkdl'                             dWN:                  coooooool'XWx                                  "
  echo "  .KMM0xOK'                             'do.                  x0KMMMX0k.ld, .00x                             "
  echo "  :MMWc.      ;oxxo:. .ll,.colll.   ;ll',ll.  .ldxo.  ,odxo:.   .MMM'  .ll; dMMNl, .ldxl,ll: clc.lxdl. ;,.   "
  echo "   oXMMMWKl .XM0;;oWW;,MMWXOOcXMN. :WMO kMMc OMMOox'.XMK:;dWW:  .MMM'  'MMO.OMMWkckMMXxkNMMX XMMOokMMN.      "
  echo "     .'lWMMoxMMX000KXk,MM0    .XMXoWMk  kMMc:MMk    oMMX000KXO  .MMM'  'MMO .MMK ,MMX   .MMX XMW   KMM'      "
  echo "  .KklcdWMW,;WMx..;oo',MMx     .KMMMx   kMMc.NMNl,;.,WMk..;oo,  .MMM'  'MMO .MMK .XMMx::OMMX XMW   KMM'      "
  echo "  ,d0XNXOo.  .d0XXKk: 'OOc      .kOo    lOO, .lOXX0' .oOKXKkc   .OOO.  .OOo .OOd  .cOXXOoOOx xOk   xOO.      "
  echo "                                                                                                             "
}

function warning_ascii() {
  echo "    "
  echo "                            'd0000d,                            "
  echo "                          .x0o;,,;lOk'                          "
  echo "                         :0d.;xOOx:.o0l                         "
  echo "                        o0l.l000000o.:0d                        "
  echo "                       x0;.d00000000x.,Ok                       "
  echo "                     .OO,'k0000000000O,'kO.                     "
  echo "                    'Ok.,O0000000000000;.x0,                    "
  echo "                   ,0d.:000xl:,,,,:cd000c.o0;                   "
  echo "                  c0l.l00o............l00o.c0l                  "
  echo "                 d0:.d00o..............c00x.;Ok.                "
  echo "               .kO,.k000;..............,000k''k0'               "
  echo "              .Ok.'O0000l..:xx;..'dxo..c0000O,.xK:              "
  echo "             ,Od.:O000000;.d00l..;00O.,0000000c.o0;             "
  echo "            c0l.l000000000.....lo..'..k00000000o.cOc            "
  echo "           d0:.d0000000000ko:..;;..;ok0000000000x.;Ox.          "
  echo "         .kO,.k0000000000000'llllll'0000000000000k''OO.         "
  echo "        .Ok''O00000000OO0000k:....;k00000O00000000O,.k0'        "
  echo "       ,0x.;O00000000k..;x0000kddk0000Oc..d000000000:.d0:       "
  echo "      lKo.c0000000000c....':lx0000kdc,....;0000000000l.l0d      "
  echo "     d0c.o00000000000dok0kdl;..,;..;cdk0kol00000000000d.;Ox     "
  echo "   .kO,.x000000000000000000xc'.,,..:x000000000000000000k.'Ok.   "
  echo "  .Ok',O0000000000000Odoc;..,oO00Oo;..;lodO0000000000000O;.x0'  "
  echo "  kk.;000000000000000'....:k00000000Oc.....O00000000000000:.xO  "
  echo "  0l.x0000000000000000Od,:000000000000l,lk0000000000000000O.cO  "
  echo "  kk',dO000000000000000000000000000000000000000000000000Od;.kO  "
  echo "  .d0d:,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,:o0x.  "
  echo "    .cxO00000000000000000000000000000000000000000000000000x,    "
  echo "    "
}

while getopts c: flag
do
  case "${flag}" in
    c) config=${OPTARG};;
  esac
done

echo "config: ${config}"

exit

if node_modules_not_installed; then
  npm install
fi

if verify_service ; then
  stlogo_ascii
  run_tests
  npx node ./watch.js "${build_id}"
else
  echo ""
  warning_ascii
  echo "  Failed to verify service."
  echo ""
  echo "  Be sure you have ran 'make start' to start the required services "
  echo "  to run tests in parallel on your localhost."
  echo ""
  exit 1
fi
