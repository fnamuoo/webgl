# -*- mode:python; coding:utf-8 -*-

# 画像（RGB）を抜き出して配列データとして表示
# 青(0,0,255) を始点
# 赤(255,0,0) を終点
# 緑(0,255,0) を中間地点とする
#
# コンソール上に点列の座標を表示（標準出力する）

from PIL import Image
import os
import math


# --------------------------------------------------
def pickupRoadInfo(filename):
    # 画像ファイルパスから読み込み
    img = Image.open(filename)
    picw = img.size[0]
    pich = img.size[1]
    
    # 画像から RGB をみて、R,G,B の座標を抜き出す
    pstart = []
    plist = []
    pgoal = []
    for iy in range(pich):
        depthline = []
        for ix in range(picw):
            rgb = img.getpixel((ix,iy))
            if (rgb[0] == 0) and (rgb[1] == 0) and (rgb[2] == 255):
                pstart = [ix, iy]
            elif (rgb[0] == 0) and (rgb[1] == 255) and (rgb[2] == 0):
                plist.append([ix, iy])
            elif (rgb[0] == 255) and (rgb[1] == 0) and (rgb[2] == 0):
                pgoal = [ix, iy]

    # 開始地点から最近傍の点を選んでいく
    plist2 = [pstart]
    [px0,py0] = pstart
    while (len(plist) > 1):
        imin = -1
        distmin = 0
        for i,[px1,py1] in enumerate(plist):
            dist = (px1-px0)**2 + (py1-py0)**2
            if imin < 0:
                imin = i
                distmin = dist
                continue
            if distmin > dist:
                imin = i
                distmin = dist
                continue
        assert(imin >= 0)
        [px0,py0] = plist.pop(imin)
        plist2.append([px0,py0])
        pass
    plist2.append(plist.pop())
    plist2.append(pgoal)

    # --------------------------------------------------
    # 近すぎる点を取り除く
    distLimit = 5 # ユークリッド距離でこれ以下ならスキップ／無視する
    plist3 = []
    [px0,py0] = [None, None]
    for i,[px1,py1] in enumerate(plist2):
        if i == 0:
            [px0,py0] = [px1,py1]
            plist3.append([px1,py1])
            continue
        dist = abs(px1-px0)+abs(py1-py0)
        if dist > distLimit:
            plist3.append([px1,py1])
            
        [px0,py0] = [px1,py1]

    return plist3

    # --------------------------------------------------
    if 0:
        # 直線にならんだ点列は取り除く
        # .. 3点のならびだけしか見ていないので、カーブにかかる点も消してしまうこともありそう
        # .. 直線にみえるところで壁のような凸形状ができる
        #      急カーブが出来てしまっているのかも
        #      道幅がそこそこあるから急カーブがあると「しわが寄る」感じで凸な道に！？
        #      解決策）もっとなだらかな点の配置にする
        #      解決策）道幅を狭くする
        plist4 = []
        [px0,py0] = [None, None]
        [px1,py1] = [None, None]
        vRot_ = 0
        for i,[px2,py2] in enumerate(plist3):
            if i == 0:
                [px0,py0] = [px2,py2]
                plist4.append([px2,py2])
                continue
            elif i == 1:
                [px1,py1] = [px2,py2]
                plist4.append([px2,py2])
                [vx1,vz1] = [(px1-px0), (py1-py0)]
                abs1 = math.sqrt(vx1**2 + vz1**2)
                [vx1,vz1] =[vx1/abs1,vz1/abs1]
                continue
            [vx2,vz2] = [(px2-px1), (py2-py1)]
            abs2 = math.sqrt(vx2**2 + vz2**2)
            [vx2,vz2] =[vx2/abs2,vz2/abs2]
            vRot = vx1*vz2 - vx2*vz1
            if vRot*vRot_ < 0:
                plist4.append([px2,py2])
                [px0,py0] = [px1,py1]
                [px1,py1] = [px2,py2]
                [vx1,vz1] = [vx2,vz2]
                continue
            if abs(vRot) > 0.001:
                plist4.append([px2,py2])
                [px0,py0] = [px1,py1]
                [px1,py1] = [px2,py2]
                [vx1,vz1] = [vx2,vz2]
            vRot_ = vRot
        return plist4

    # --------------------------------------------------
    if 0:
        # 上記の
        #      解決策）もっとなだらかな点の配置にする
        # に着目して、改良を加えた版
        # カーブにかかる点を取り除かないように...
        #
        # １回目でカーブにかかる点を取り除かないようにロックする
        # ２回目で改めて直線にならんだ点を取り除く
        #
        # これでも凸な道ができることがある
        # 点の間隔／距離を見て、等間隔／等比級数？になるようにすべき？
        # これ（等間隔／等比級数）を自動で判別するのは面倒そう
        plist3lock = []
        [px0,py0] = [None, None]
        [px1,py1] = [None, None]
        vRot_ = 0
        for i,[px2,py2] in enumerate(plist3):
            if i == 0:
                [px0,py0] = [px2,py2]
                plist3lock.append(True)
                continue
            elif i == 1:
                [px1,py1] = [px2,py2]
                [vx1,vz1] = [(px1-px0), (py1-py0)]
                abs1 = math.sqrt(vx1**2 + vz1**2)
                [vx1,vz1] =[vx1/abs1,vz1/abs1]
                plist3lock.append(True)
                continue
            [vx2,vz2] = [(px2-px1), (py2-py1)]
            abs2 = math.sqrt(vx2**2 + vz2**2)
            [vx2,vz2] =[vx2/abs2,vz2/abs2]
            vRot = vx1*vz2 - vx2*vz1
            if vRot*vRot_ < 0:
                plist3lock[-2] = True
                plist3lock[-1] = True
                plist3lock.append(True)
                continue
            if abs(vRot) > 0.001:
                plist3lock[-2] = True
                plist3lock[-1] = True
                plist3lock.append(True)
            else:
                plist3lock.append(False)
            [px0,py0] = [px1,py1]
            [px1,py1] = [px2,py2]
            [vx1,vz1] = [vx2,vz2]
            vRot_ = vRot
        plist4 = []
        for p3,p3lock in zip(plist3,plist3lock):
            if p3lock:
                plist4.append(p3)
        return plist4

    



def main():
    if 0:
        # 複数を一括操作
        fpathlist = ['pic/GT5_Circuit_Autumn_Ring.png',
                     '''pic/GT5_circuit_Cote_d'Azur.png''',
                     'pic/GT5_Circuit_High_Speed_Ring_Fwd.png',
                     'pic/GT5_circuit_Suzuka.png',
                     'pic/mm2024_00_zenkoku__MM2024RT.png',
                     'pic/mm2024_04_tyubu__MM2024_chubu_RT.png',
                     'pic/mm2024_08_knasai__MM2024_kansai_RT.png',

                     'pic/GT4_circuit_Motegi_Super_Speedway.png',
                     'pic/GT5_circuit_Daytona_Speedway.png',

                     ]

        fpathlist = [
            'pic/GT5_circuit_Daytona_Speedway_line1.png',
            'pic/GT5_circuit_Daytona_Speedway_line2.png',
            'pic/GT5_circuit_Daytona_Speedway_line3.png',
            ]

        for filename in fpathlist:
            plist = pickupRoadInfo(filename)
            print(os.path.basename(filename))
            print(", ".join([str(x) for x in plist]))


    if 1:
        # 単品で操作

        filename =   'pic/GT5_Circuit_Autumn_Ring.png'
        #filename =   'pic/mm2024_00_zenkoku__MM2024RT.png'
        #filename =   'pic/GT4_circuit_Motegi_Super_Speedway.png'
        #filename =   'pic/GT5_circuit_Daytona_Speedway.png'

        plist = pickupRoadInfo(filename)

        print(os.path.basename(filename))
        print(", ".join([str(x) for x in plist]))


if __name__ == '__main__':
    main()
