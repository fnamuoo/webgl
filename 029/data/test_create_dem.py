# -*- mode:python; coding:utf-8 -*-

import os
import math
import struct

# 標高データ（疑似）を作成

if 1:
    # 全ブロック数
    nBlockH = 10
    nBlockW = 10
    # 1ブロック当たりの直交メッシュの点の数
    nNodePBW = 11
    nNodePBH = 11
    nNodePBW_ = nNodePBW - 1
    nNodePBH_ = nNodePBH - 1
    # 全サイズの直交メッシュの点の数
    nTotalNodeW = nNodePBW_*nBlockW+1
    nTotalNodeH = nNodePBH_*nBlockH+1
    # 周期
    sinPeriodW = nNodePBW_*3
    sinPeriodH = nNodePBH_*4
    # 高さ倍率
    ampHigh = 5.0
    ampHighAdj = 0

    demTotal = []
    PI2 = math.pi * 2
    print(f"# nTotalNodeH={nTotalNodeH}, nTotalNodeW={nTotalNodeW}")
    for ih in range(nTotalNodeH):
        tmpRow = []
        for iw in range(nTotalNodeW):
            height = math.cos((iw / sinPeriodW) * PI2) * math.cos((ih / sinPeriodH) * PI2) * ampHigh + ampHighAdj
            tmpRow.append(height)
        demTotal.append(tmpRow)

    if 1:
        # 全データ（一枚絵）出力 テキスト
        fpath = f"test_demTotal.csv"
        with open(fpath, "w") as fobj:
            for line in demTotal:
                stmp = ",".join([str(v) for v in line])
                fobj.write(stmp + "\n")

    if 1:
        # 全データ（一枚絵）出力 バイナリ
        fmtPack = "<f"
        fpath = f"test_demTotal.bin.f32"
        with open(fpath, "wb") as fobj:
            binBody = b""
            for line in demTotal:
                for v in line:
                    binBody += struct.pack(fmtPack, v)
            fobj.write(binBody)


    vmin = min(demTotal[0])
    for line in demTotal:
        v_ = min(line)
        if vmin > v_:
            vmin = v_
    vmax = max(demTotal[0])
    for line in demTotal:
        v_ = max(line)
        if vmax < v_:
            vmax = v_
    vrng = vmax - vmin
    print(f"  vmin={vmin}  vmax={vmax}  vrng={vrng}\n----------")

    if 1:
        # 全データ（一枚絵）出力 バイナリ
        # uint16  [0,65535] を 1/1000 して [0, 65.535] の範囲(1/1000の精度)で凹凸を表現
        # format
        #   0: 1 このフォーマットを示す識別子
        #   1: {最小値の整数部} ：負値は正負逆転して 32767を足したもの　／　復元時は 32767以上、未満で場合分け
        #   2: {最小値の小数部} ：小数部を 1000倍した整数
        #   x: 格納時は 実際の値から 最小値を引いて、1000倍した もの  ／  復元時は1/1000倍して最小値を加算
        fmtPack = "<H"
        fpath = f"test_demTotal.bin.i16v1"

        vmin_ = int(vmin*1000)
        vminr = float(vmin_)/1000.0

        (vminf, vmini) = math.modf(vminr)
        vmini = int(vmini)
        if vmini < 0:
            vmini = 32767 - vmini
        vminf = int(vminf*1000)

        vmaxr = vminr + 65.535
        print(f"vmin ={vmin}")
        print(f"vminr={vminr}")
        print(f"vmax ={vmax}")
        print(f"vmaxr={vmaxr}")
        with open(fpath, "wb") as fobj:
            binBody = b""
            binBody += struct.pack(fmtPack, 1)
            binBody += struct.pack(fmtPack, vmini)
            binBody += struct.pack(fmtPack, vminf)
            for line in demTotal:
                for v in line:
                    v_ = int((v - vminr)*1000)
                    binBody += struct.pack(fmtPack, v_)
            fobj.write(binBody)

    if 1:
        # 全データ（一枚絵）出力 バイナリ
        # uint32  [0,65535] を 1/100 して [0, 655.35] の範囲(1/100の精度)で凹凸を表現
        # 精度が粗く、より広い範囲に対応
        # format
        #   0: 2 このフォーマットを示す識別子
        #   1: {最小値} ：格納時は実際の最小値を 100倍したもの　／　復元時は 1/100倍したもの
        #   x: 格納時は 実際の値から 最小値を引いて、100倍した もの  ／  復元時は1/100倍して最小値を加算
        fmtPack = "<H"
        # fpath = f"dem_binf32/_demTotal.bin.f32"
        fpath = f"test_demTotal.bin.i16v2"

        vmin_ = int(vmin*100)
        vminr = float(vmin_)/100.0

        (vminf, vmini) = math.modf(vminr)
        vmini = int(vmini)
        if vmini < 0:
            vmini = 32767 - vmini
        vminf = int(vminf*1000)

        vmaxr = vminr + 655.35
        print(f"vmin ={vmin}")
        print(f"vminr={vminr}")
        print(f"vmax ={vmax}")
        print(f"vmaxr={vmaxr}")
        with open(fpath, "wb") as fobj:
            binBody = b""
            binBody += struct.pack(fmtPack, 2)
            binBody += struct.pack(fmtPack, vmini)
            binBody += struct.pack(fmtPack, vminf)
            for line in demTotal:
                for v in line:
                    v_ = int((v - vminr)*100)
                    binBody += struct.pack(fmtPack, v_)
            fobj.write(binBody)


    
