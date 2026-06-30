import urllib.request
import urllib.error

def test_endpoint(url):
    print(f"Testing URL: {url}")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            status = response.status
            headers = response.info()
            content_type = headers.get('Content-Type')
            content_disposition = headers.get('Content-Disposition')
            print(f"  Status: {status}")
            print(f"  Content-Type: {content_type}")
            print(f"  Content-Disposition: {content_disposition}")
            data = response.read(100) # read first 100 bytes
            print(f"  Read {len(data)} bytes of response data.")
    except urllib.error.HTTPError as e:
        print(f"  HTTPError: {e.code} - {e.reason}")
        try:
            error_data = e.read().decode('utf-8')
            print(f"    Details: {error_data}")
        except Exception:
            pass
    except Exception as e:
        print(f"  Error: {e}")

test_endpoint("http://127.0.0.1:8000/api/v1/alumni/export?upload_id=117")
test_endpoint("http://127.0.0.1:8000/api/v1/upload/download/117")
