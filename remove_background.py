from PIL import Image
import os

# 获取当前脚本所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 图片路径
img_path = os.path.join(current_dir, 'img', 'loge.png')
output_path = os.path.join(current_dir, 'img', 'loge_transparent.png')

# 打开图片并转换为RGBA模式
image = Image.open(img_path).convert('RGBA')
pixels = image.load()

# 设置颜色阈值（保留白色文字，去掉蓝色背景）
# 白色文字的RGB值接近(255, 255, 255)
# 蓝色背景的RGB值在蓝色范围内(0-100, 0-100, 100-255)
white_threshold = 200  # RGB值高于此值被认为是白色
blue_threshold = 100   # 蓝色通道低于此值，红色和绿色通道高于此值的不被认为是蓝色背景

try:
    # 遍历所有像素
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            
            # 判断是否是白色文字（RGB值都高于白色阈值）
            is_white_text = r > white_threshold and g > white_threshold and b > white_threshold
            
            # 判断是否是蓝色背景（蓝色通道高，红色和绿色通道低）
            is_blue_background = b > 150 and r < blue_threshold and g < blue_threshold
            
            # 如果是蓝色背景，则设置为完全透明
            # 如果是白色文字或其他非蓝色内容，则保持不透明
            if is_blue_background:
                pixels[x, y] = (r, g, b, 0)  # 设置Alpha通道为0（完全透明）
            else:
                pixels[x, y] = (r, g, b, 255)  # 设置Alpha通道为255（完全不透明）
    
    # 保存处理后的图片
    image.save(output_path, 'PNG')
    print(f'处理完成！透明背景图片已保存为: {output_path}')
    
    # 提示用户
    print('\n请检查处理后的图片效果。如果不满意，可以调整脚本中的threshold值重新运行。')
    print('threshold值越大，保留的非背景像素越多；值越小，移除的背景越多。')
    
except Exception as e:
    print(f'处理图片时出错: {str(e)}')
    import traceback
    traceback.print_exc()