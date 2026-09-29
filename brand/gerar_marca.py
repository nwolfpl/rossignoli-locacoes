"""
Gera todos os arquivos de marca a partir de brand/emblema-rl.png.

O emblema veio de uma foto de perfil de 150x150 px (o conteúdo real da marca tem
106 px). Por isso a imagem foi limpa, ampliada em degraus e teve o fundo
removido; o painel escuro em volta é redesenhado aqui, e não ampliado, para
ficar nítido em qualquer tamanho. Quando chegar o arquivo original em alta,
basta trocar brand/emblema-rl.png e rodar de novo.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
EMBLEMA = Image.open(RAIZ / "brand/emblema-rl.png").convert("RGBA")
FONTE = "/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf"
LARANJA = (224, 112, 30)


def fundo(lado, raio_frac=0.0):
    """Painel escuro com a luz do original: mais claro no alto à esquerda."""
    g = Image.new("RGB", (lado, lado))
    px = g.load()
    a, b = (58, 58, 58), (10, 10, 10)
    for y in range(lado):
        for x in range(lado):
            t = (x + y) / (2 * (lado - 1))          # diagonal
            t = t ** 0.85                          # a luz cai devagar no começo
            px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    if not raio_frac:
        return g.convert("RGBA")
    m = Image.new("L", (lado, lado), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, lado - 1, lado - 1], radius=int(lado * raio_frac), fill=255)
    out = g.convert("RGBA"); out.putalpha(m)
    return out


def com_sombra(emb, lado):
    """Sombra suave sob as letras: repõe a profundidade do bisel do original."""
    pad = int(lado * 0.06)
    tela = Image.new("RGBA", (emb.width + pad * 2, emb.height + pad * 2), (0, 0, 0, 0))
    sombra = Image.new("RGBA", emb.size, (0, 0, 0, 0))
    sombra.putalpha(emb.split()[3].point(lambda v: int(v * 0.65)))
    desloc = max(1, int(lado * 0.012))
    tela.paste(sombra, (pad + desloc, pad + desloc), sombra)
    tela = tela.filter(ImageFilter.GaussianBlur(max(1, lado * 0.012)))
    tela.alpha_composite(emb, (pad, pad))
    return tela, pad


def icone(lado, ocupa, rotulo=None, raio_frac=0.0):
    """
    Emblema centralizado. `ocupa` é a fração da largura que o RL ocupa.
    `rotulo` (ex.: 'PAINEL') entra embaixo, no lugar onde o original tinha o nome.
    """
    base = fundo(lado, raio_frac)
    larg = int(lado * ocupa)
    emb = EMBLEMA.resize((larg, int(EMBLEMA.height * larg / EMBLEMA.width)), Image.LANCZOS)
    bloco, pad = com_sombra(emb, lado)

    alt_rot = 0
    if rotulo:
        fonte = ImageFont.truetype(FONTE, int(lado * 0.13))
        caixa = ImageDraw.Draw(base).textbbox((0, 0), rotulo, font=fonte)
        alt_rot = int((caixa[3] - caixa[1]) + lado * 0.05)

    total = emb.height + alt_rot
    y0 = (lado - total) // 2
    base.alpha_composite(bloco, ((lado - bloco.width) // 2, y0 - pad))

    if rotulo:
        d = ImageDraw.Draw(base)
        caixa = d.textbbox((0, 0), rotulo, font=fonte)
        lt = caixa[2] - caixa[0]
        d.text(((lado - lt) / 2 - caixa[0], y0 + emb.height + lado * 0.05 - caixa[1]),
               rotulo, font=fonte, fill=LARANJA)
    return base


if __name__ == "__main__":
    ic = RAIZ / "icons"; ic.mkdir(exist_ok=True)
    for nome, rot in (("site", None), ("painel", "PAINEL")):
        # "any": cantos arredondados, aparece como está nos launchers.
        for px in (192, 512):
            icone(px, 0.70, rot, raio_frac=0.18).save(ic / f"{nome}-{px}.png")
            # Mascarável: sangra até a borda, conteúdo no miolo de 80% (o SO recorta).
            icone(px, 0.52, rot).convert("RGB").save(ic / f"{nome}-{px}-mascara.png")
        # iOS arredonda sozinho e pinta transparência de preto: quadrado cheio.
        icone(180, 0.70, rot).convert("RGB").save(ic / f"{nome}-apple-180.png")

    # Favicon: sem rótulo, o RL tem de ocupar quase tudo para ler em 16 px.
    icone(256, 0.84, raio_frac=0.16).save(RAIZ / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    # Emblema solto para o cabeçalho escuro do site e do painel (3x de 44 px).
    alt = 132
    EMBLEMA.resize((int(EMBLEMA.width * alt / EMBLEMA.height), alt), Image.LANCZOS).save(RAIZ / "brand/rl-cabecalho.png", optimize=True)
    print("marca gerada")


def logo_completo(lado):
    """
    A logo inteira, como a original: RL, traço e o nome embaixo.

    O nome NÃO vem da imagem: no arquivo recebido ele tem uns 10 px de altura e
    viraria borrão ampliado. Ele é redesenhado como texto, na fonte condensada
    que o próprio site declara, e por isso sai nítido em qualquer tamanho.
    """
    base = fundo(lado)
    larg = int(lado * 0.72)
    emb = EMBLEMA.resize((larg, int(EMBLEMA.height * larg / EMBLEMA.width)), Image.LANCZOS)
    bloco, pad = com_sombra(emb, lado)

    nome = "ROSSIGNOLI LOCAÇÕES"
    fonte = ImageFont.truetype(FONTE, int(lado * 0.085))
    d = ImageDraw.Draw(base)
    # Espaçamento aberto como no original: desenha letra a letra.
    esp = lado * 0.006
    largs = [d.textbbox((0, 0), c, font=fonte)[2] for c in nome]
    total_txt = sum(largs) + esp * (len(nome) - 1)
    # Nome não pode passar da largura do emblema.
    if total_txt > larg:
        fonte = ImageFont.truetype(FONTE, int(lado * 0.085 * larg / total_txt))
        largs = [d.textbbox((0, 0), c, font=fonte)[2] for c in nome]
        total_txt = sum(largs) + esp * (len(nome) - 1)
    cx = d.textbbox((0, 0), nome, font=fonte)
    alt_txt = cx[3] - cx[1]

    folga = int(lado * 0.045)
    altura_bloco = emb.height + folga + alt_txt
    y0 = (lado - altura_bloco) // 2
    base.alpha_composite(bloco, ((lado - bloco.width) // 2, y0 - pad))

    x = (lado - total_txt) / 2
    y = y0 + emb.height + folga - cx[1]
    for c, w in zip(nome, largs):
        d.text((x, y), c, font=fonte, fill=(244, 241, 236))
        x += w + esp
    return base


def og_com_marca(foto, destino):
    """
    A imagem de compartilhamento continua sendo a foto do caminhão — é ela que
    convence no WhatsApp. A marca entra por cima, dentro do quadrado central:
    prévias pequenas recortam o centro da imagem e cortariam um canto.
    """
    img = Image.open(foto).convert("RGBA")
    W, H = img.size
    selo = icone(int(H * 0.21), 0.70, raio_frac=0.18)
    x = (W - H) // 2 + int(H * 0.04)           # borda esquerda do quadrado central
    y = int(H * 0.05)
    img.alpha_composite(selo, (x, y))
    img.convert("RGB").save(destino, quality=88, optimize=True)


if __name__ == "__main__":
    logo_completo(1024).convert("RGB").save(RAIZ / "brand/logo-completo-1024.png", optimize=True)
    logo_completo(512).convert("RGB").save(RAIZ / "brand/logo-completo-512.png", optimize=True)
    orig = RAIZ / "brand/og-original.jpg"
    if not orig.exists():
        import shutil; shutil.copy(RAIZ / "og.jpg", orig)   # a foto limpa fica guardada
    og_com_marca(orig, RAIZ / "og.jpg")
    print("logo completa e og.jpg gerados")
