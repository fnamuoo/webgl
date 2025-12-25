# -*- mode:python; coding:utf-8 -*-

# 画像（RGB）を抜き出して配列データとして表示
# 青(0,0,255) を始点
# 赤(255,0,0) を終点
# 緑(0,255,0) を中間地点とする
#
# 紫(255,0,255) を点を結ぶ際の補間点とする
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
    plist_ = []
    pglist = []
    for iy in range(pich):
        depthline = []
        for ix in range(picw):
            rgb = img.getpixel((ix,iy))
            if (rgb[0] == 0) and (rgb[1] == 0) and (rgb[2] == 255):
                pstart = [ix, iy]
            elif (rgb[0] == 0) and (rgb[1] == 255) and (rgb[2] == 0):
                plist.append([ix, iy])
            elif (rgb[0] == 255) and (rgb[1] == 0) and (rgb[2] == 255): # 紫
                plist_.append([ix, iy])
            elif (rgb[0] == 255) and (rgb[1] == 0) and (rgb[2] == 0):
                pglist.append([ix, iy])
    print("pstart=",pstart)
    print("plist.size=",len(plist))
    print("plist_.size=",len(plist_))
    print("pglist.size=",len(pglist))


    # 開始地点から最近傍の点を選んでいく
    plist2 = [pstart]
    [px0,py0] = pstart
    # while (len(plist) > 1) or (len(plist_) > 0):
    while (len(plist) > 1):
        imin = -1
        jmin = -1
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
        for j,[px1,py1] in enumerate(plist_):
            dist = (px1-px0)**2 + (py1-py0)**2
            # if jmin < 0:
            #     jmin = j
            #     distmin = dist
            #     continue
            if distmin > dist:
                imin = -1
                jmin = j
                distmin = dist
                continue
        if (imin < 0 and jmin < 0):
            print("plist.size=", len(plist))
            print("plist_.size=", len(plist_))
            print("imin=", imin, ", jmin=", jmin)
        assert(imin >= 0 or jmin >= 0)
        if imin >= 0:
            [px0,py0] = plist.pop(imin)
            plist2.append([px0,py0])
        elif jmin >= 0:
            [px0,py0] = plist_.pop(jmin)
        pass
    if len(plist) > 0:
        plist2.append(plist.pop())

    while len(pglist) > 1:
        imin = -1
        distmin = 0
        for i,[px1,py1] in enumerate(pglist):
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
        [px0,py0] = pglist.pop(imin)
        plist2.append([px0,py0])
        pass
    plist2.append(pglist.pop())
    print("plist2.size=",len(plist2))

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

        fpathlist = [
            '',
            '',
            ]

        for filename in fpathlist:
            plist = pickupRoadInfo(filename)
            print(os.path.basename(filename))
            print(", ".join([str(x) for x in plist]))


    if 1:
        # 単品で操作

        # ピンクの点(plist_)が多いとエラー

        # filename = 'org/001.サーキット秋ヶ瀬/_001_akigase_500.png'
        # filename = 'org/001.サーキット秋ヶ瀬/_001_akigase_500_b.png' # ヘアピン頂点を削除
        # filename = 'org/001.サーキット秋ヶ瀬/_001_akigase_500_c.png' # ヘアピン頂点を削除＋近傍を寄せる
        # filename = 'org/001.サーキット秋ヶ瀬/_001_akigase_500_d.png' # ヘアピン頂点を削除せずに＋近傍と距離をおく
        # filename = 'org/001.サーキット秋ヶ瀬/_001_akigase_500_e.png' # ヘアピン頂点を削除せずに＋近傍を寄せる

        # filename = 'org/002.新東京サーキット/__02_sin_tokyo_500.png'
        # filename = 'org/003.大井松田カートランド/__03_ohi_matsuda_KL_500.png'
        # filename = 'org/004.シティカート/__22ploc22ploc22pl.png'
        #filename = 'org/004.シティカート/__22ploc22ploc22pl_b.png'
        filename = 'org/005.ハーバーサーキット/__005_hyper_line_500.png'

        # filename = 'org/006.Fドリーム平塚/__qzsft2qzsft2qzsf.png'
        # filename = 'org/007.ツインリンクもてぎ/__007_twin_motgi_sourth.png'
        # filename = 'org/007.ツインリンクもてぎ/__07_twin_motegi_north_500.png'
        # filename = 'org/007.ツインリンクもてぎ/__twin_motegi_movility.png'
        # filename = 'org/008.石野サーキット/__008_ishino.png'
        # filename = 'org/009.琵琶湖スポーツランド/__009_biwako.png'
        # filename = 'org/020.茂原ツインサーキット/__020_mobara_twin_east.png'
        # filename = 'org/020.茂原ツインサーキット/__020_mobara_twin_west.png'
        # filename = 'org/021.クイック潮来/__021_919_itako.png'
        # filename = 'org/022.榛名モータースポーツランド/__022_haruna.png'
        # filename = 'org/023.オートパラダイス御殿場/__023_getenba_high.png'
        # filename = 'org/023.オートパラダイス御殿場/__023_gotenba_tech.png'
        # filename = 'org/024.井頭モータースポーツ/__024_igashira.png'
        # filename = 'org/025.ISK前橋店/__025_ISK_itabashi.png'
        # filename = 'org/026.ハーバーサーキット木更津/__026_kisarazu.png'
        # filename = 'org/026.ハーバーサーキット木更津/__026_kisarazu_b.png'
        # filename = 'org/101.富士スピードウェイ/__101_fuji_speedway.png'
        # filename = 'org/102.エビスサーキット/__102_ebisu_east.png'
        # filename = 'org/102.エビスサーキット/__102_ebisu_north.png'
        # filename = 'org/102.エビスサーキット/__102_ebisu_north_b.png'
        # filename = 'org/102.エビスサーキット/__102_ebisu_north_c.png'
        # filename = 'org/102.エビスサーキット/__102_ebisu_west.png'
        # filename = 'org/102.エビスサーキット/__102_ebisu_touge.png'
        # filename = 'org/102.エビスサーキット/__102_ebisu_touge_b.png'
        #filename = 'org/102.エビスサーキット/__102_ebisu_touge_c.png'

        # filename = 'org/103.鈴鹿ツインサーキット/__103_suzuka_twin_full.png'
        # filename = 'org/103.鈴鹿ツインサーキット/__103_suzuka_twin_full_b.png'
        # filename = 'org/103.鈴鹿ツインサーキット/__103_suzuka_twin_drift.png'
        # filename = 'org/103.鈴鹿ツインサーキット/__103_suzuka_twin_drift_b.png'
        # filename = 'org/103.鈴鹿ツインサーキット/__103_suzuka_twin_grid.png'
        # filename = 'org/103.鈴鹿ツインサーキット/__103_suzuka_twin_grid_b.png'

        plist = pickupRoadInfo(filename)

        print(os.path.basename(filename))
        print(", ".join([str(x) for x in plist]))


if __name__ == '__main__':
    main()
