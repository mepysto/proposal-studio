import urllib.request,urllib.parse,pathlib,json
q='''[out:json][timeout:45];(way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|footway|pedestrian|service"](36.790,127.120,36.830,127.180);way["railway"="rail"](36.790,127.120,36.830,127.180);way["waterway"](36.790,127.120,36.830,127.180);way["natural"="water"](36.790,127.120,36.830,127.180););out geom;'''
u='https://overpass-api.de/api/interpreter?'+urllib.parse.urlencode({'data':q})
r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'ProposalStudio/0.6 local map research'}),timeout=55)
b=r.read();pathlib.Path('references/research/maps/cheonan-osm.json').write_bytes(b);print(len(b),len(json.loads(b).get('elements',[])))
