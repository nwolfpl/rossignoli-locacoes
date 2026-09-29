"""
Gera todos os arquivos de marca a partir de dois recortes da logo original
(brand/logo-original-1600.webp):

- brand/emblema-rl.png: RL e o traço laranja, sem fundo;
- brand/nome-rossignoli.png: ROSSIGNOLI LOCAÇÕES, sem fundo.

O painel escuro em volta não é recortado da imagem: é redesenhado aqui, com a
mesma luz diagonal, para ficar nítido em qualquer tamanho e sem a moldura e o
artefato branco do canto que vêm no arquivo.

Rodar de novo depois de trocar qualquer um dos dois recortes atualiza ícones,
favicon, logo completa, imagem de compartilhamento e a página offline.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
EMBLEMA = Image.open(RAIZ / "brand/emblema-rl.png").convert("RGBA")
NOME = Image.open(RAIZ / "brand/nome-rossignoli.png").convert("RGBA")
FONTE = "/System/Library/Fonts/Supplemental/Trebuchet MS Bold.ttf"   # a mais próxima do nome original
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
    A logo inteira, como a original: RL, traço e o nome embaixo — o nome recortado
    do arquivo original, não redesenhado. Proporções medidas no original: o nome
    tem a largura do emblema e fica a 8% da altura dele abaixo do traço.
    """
    base = fundo(lado)
    larg = int(lado * 0.74)
    emb = EMBLEMA.resize((larg, round(EMBLEMA.height * larg / EMBLEMA.width)), Image.LANCZOS)
    nome = NOME.resize((larg, round(NOME.height * larg / NOME.width)), Image.LANCZOS)
    bloco, pad = com_sombra(emb, lado)

    folga = round(emb.height * 0.08)
    total = emb.height + folga + nome.height
    y0 = (lado - total) // 2
    base.alpha_composite(bloco, ((lado - bloco.width) // 2, y0 - pad))
    base.alpha_composite(nome, ((lado - nome.width) // 2, y0 + emb.height + folga))
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


def atualiza_offline():
    """A página offline não pode buscar nada na rede, então a logo vai dentro dela."""
    import base64, io, re
    alt = 88
    e = EMBLEMA.resize((round(EMBLEMA.width * alt / EMBLEMA.height), alt), Image.LANCZOS)
    buf = io.BytesIO(); e.save(buf, "PNG", optimize=True)
    uri = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    p = RAIZ / "offline/index.html"
    s = p.read_text(encoding="utf-8")
    s, n = re.subn(r'(<img class="rl" alt="" width=")\d+(" height="44" src=")data:image/png;base64,[^"]+"',
                   lambda m: f'{m.group(1)}{round(e.width / 2)}{m.group(2)}{uri}"', s)
    assert n == 1, "logo da página offline não encontrada"
    p.write_text(s, encoding="utf-8")


if __name__ == "__main__":
    atualiza_offline()
    logo_completo(1024).convert("RGB").save(RAIZ / "brand/logo-completo-1024.png", optimize=True)
    logo_completo(512).convert("RGB").save(RAIZ / "brand/logo-completo-512.png", optimize=True)
    orig = RAIZ / "brand/og-original.jpg"
    if not orig.exists():
        import shutil; shutil.copy(RAIZ / "og.jpg", orig)   # a foto limpa fica guardada
    og_com_marca(orig, RAIZ / "og.jpg")
    print("logo completa e og.jpg gerados")
