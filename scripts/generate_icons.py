"""
Mini Stock Portfolio - アイコン生成スクリプト
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size: int) -> Image.Image:
    """株価チャート風アイコンを生成"""
    # 背景（グラデーション風の水色）
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 角丸背景
    padding = size // 8
    radius = size // 5

    # グラデーション背景を描画
    for y in range(size):
        ratio = y / size
        r = int(14 + (56 - 14) * ratio)
        g = int(165 + (189 - 165) * ratio)
        b = int(233 + (248 - 233) * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    # 角丸マスク適用
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(
        [(0, 0), (size - 1, size - 1)],
        radius=radius,
        fill=255
    )
    img.putalpha(mask)

    # チャートライン描画
    draw = ImageDraw.Draw(img)

    # チャートの座標（サイズに応じてスケール）
    margin = size // 5
    chart_height = size // 2
    chart_top = size // 4

    # 上昇トレンドのチャートポイント
    points = [
        (margin, chart_top + chart_height * 0.7),
        (size * 0.35, chart_top + chart_height * 0.3),
        (size * 0.55, chart_top + chart_height * 0.5),
        (size - margin, chart_top + chart_height * 0.1),
    ]

    # ラインの太さ
    line_width = max(2, size // 16)

    # チャートライン（白）
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=(255, 255, 255, 255), width=line_width)

    # 終点に緑の丸（上昇を示す）
    dot_radius = max(2, size // 16)
    end_point = points[-1]
    draw.ellipse(
        [
            (end_point[0] - dot_radius, end_point[1] - dot_radius),
            (end_point[0] + dot_radius, end_point[1] + dot_radius)
        ],
        fill=(16, 185, 129, 255)  # 緑色
    )

    # 下部にバー（インジケーター風）
    bar_y = size - margin
    bar_height = max(2, size // 16)
    bar_width = size // 6
    bar_gap = size // 12

    for i in range(3):
        x = margin + i * (bar_width + bar_gap)
        draw.rounded_rectangle(
            [(x, bar_y - bar_height), (x + bar_width, bar_y)],
            radius=max(1, bar_height // 2),
            fill=(255, 255, 255, 150)
        )

    return img


def main():
    # 出力ディレクトリ
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
    os.makedirs(output_dir, exist_ok=True)

    # 各サイズのアイコンを生成
    sizes = [16, 48, 128]

    for size in sizes:
        icon = create_icon(size)
        output_path = os.path.join(output_dir, f'icon{size}.png')
        icon.save(output_path, 'PNG')
        print(f'生成完了: {output_path}')

    print('\nすべてのアイコンを生成しました！')


if __name__ == '__main__':
    main()
